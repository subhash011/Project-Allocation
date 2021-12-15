const express = require("express");
const router = express.Router();

const Programs = require("../models/Programs");
const Student = require("../models/Student");
const Project = require("../models/Project");

function isSubsequence(arrayA, arrayB) {
    let b = 0;
    for (let i = 0; i < arrayA.length && b < arrayB.length; i++) {
        if (arrayA[i].equals(arrayB[b])) {
            b++;
            if (b === arrayB.length) {
                break;
            }
        }
    }
    return b === arrayB.length;
}

router.post("/reset", async (req, res) => {
    let programs = await Programs.find({});
    programs = programs.map(val => val.short);
    for (const program of programs) {
        let students = await Student.find({ stream: program }).sort([["gpa", -1]]).lean().select("_id");
        await Project.updateMany({stream: program}, {students_id: [], not_students_id: students, reorder: 0});
        await Student.updateMany({stream: program}, {projects_preference: []});
    }
    res.status(200).send("Reset done");
})

// test if the projects and students collections tally.
router.get("/assert/order", async (req, res) => {
    try {
        let programs = await Programs.find({});
        const errors = {};
        programs = programs.map(val => val.short);
        for (const program of programs) {
            errors[program] = [];
            let students = await Student.aggregate([
                {
                    $match: {
                        stream: program
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);
            let projects = await Project.aggregate([
                {
                    $match: {
                        stream: program
                    }
                }
            ]);
            for (const project of projects) {
                project.not_students_id = project.not_students_id.sort();
                project.students_id = project.students_id.sort()
                if (!isSubsequence(students.map(val => val._id), project.students_id)) {
                    errors[program].push({
                        project: project._id,
                        students_id: project.students_id,
                        allStudents: students.map(val => val._id)
                    });
                }
                if (!isSubsequence(students.map(val => val._id), project.not_students_id)) {
                    errors[program].push({
                        project: project._id,
                        not_students_id: project.not_students_id,
                        allStudents: students.map(val => val._id)
                    });
                }
            }
        }
        res.status(200).send(errors);
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

router.get("/remove_duplicates", async (req, res) => {
    try {
        let programs = await Programs.find({});
        const promises = [];
        programs = programs.map(val => val.short);
        for (const program of programs) {
            let projects = await Project.find({stream: program});
            for (const project of projects) {
                project.not_students_id = project.not_students_id.filter(onlyUnique);
                project.students_id = project.students_id.filter(onlyUnique);
                promises.push(project.save());
            }
        }
        await Promise.all(promises);
        res.status(200).send("Done");
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

module.exports = router;