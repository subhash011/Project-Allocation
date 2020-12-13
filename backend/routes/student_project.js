const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");

async function canUpdateProject(res, idToken, id) {
    try {
        let student = await Student.findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("_id stream");
        if (!student) {
            res.json({message: "invalid-token"});
            return false;
        }
        let admin = await Admin.findOne({stream: student.stream})
            .lean()
            .select("stage reachedStage2");

        if (admin.stage < 1) {
            res.json({message: "stage-not-started"});
            return false;
        } else if (admin.stage >= 2) {
            res.json({message: "stage-ended"});
            return false;
        }
        return {
            student: student,
            toSort: !admin.reachedStage2
        };
    } catch (e) {
        res.json({message: "invalid-token"});
    }
}

function isSubsequence(arrayA, arrayB) {
    let b = 0;
    for (let i = 0; i < arrayA.length; i++) {
        if (arrayA[i] === arrayB[b]) {
            b++;
            if (b === arrayB.length) {
                break;
            }
        }
    }
    return b === arrayB.length;
}

// fetch project details of the student's stream
router.get("/:id", async (req, res) => {
    try {
        const student_projects = [];
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let stream;
        let student = await Student.findOne({google_id: {id: id, idToken: idToken}}).lean().select("stream");
        if (student) {
            stream = student["stream"];
        } else {
            res.json({
                message: "token-expired"
            });
            return;
        }
        let projectPop = {
            path: "faculty_id",
            select: "name email",
            model: Faculty
        };
        let projects = await Project.find({stream: stream}).lean().select("-students_id -student_alloted -isIncluded -__v").populate(projectPop);
        for (const project of projects) {
            const details = {
                _id: project["_id"],
                title: project["title"],
                description: project["description"],
                duration: project["duration"],
                studentIntake: project["studentIntake"],
                faculty_name: project["faculty_id"]["name"],
                faculty_email: project["faculty_id"]["email"]
            };
            student_projects.push(details);
        }
        res.json({
            message: "success",
            result: student_projects
        });
    } catch (e) {
        res.json({
            message: "invalid-client",
            result: null
        });
    }
});

// fetch student preferences
router.get("/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let populator = {
            path: "projects_preference",
            select: {
                _id: 1,
                title: 1,
                description: 1,
                duration: 1,
                studentIntake: 1
            },
            model: Project,
            populate: {
                path: "faculty_id",
                select: {
                    name: 1,
                    email: 1
                },
                model: Faculty
            }
        };
        let student = await Student.findOne({google_id: {id: id, idToken: idToken}}).lean().populate(populator);
        if (student) {
            const studPrefs = student.projects_preference.map((val) => {
                return {
                    _id: val._id,
                    title: val.title,
                    description: val.description,
                    duration: val.duration,
                    studentIntake: val.studentIntake,
                    faculty_name: val.faculty_id.name,
                    faculty_email: val.faculty_id.email
                };
            });
            res.json({
                message: "success",
                result: studPrefs
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// add projects to preferences
router.post("/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let projects = req.body;
        const project_idArr = projects.map((val) =>
            mongoose.Types.ObjectId(val["_id"])
        );

        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        let studentID = student._id;

        let populator = {
            path: "projects_preference",
            select: {
                _id: 1,
                title: 1,
                description: 1,
                duration: 1,
                studentIntake: 1
            },
            model: Project,
            populate: {
                path: "faculty_id",
                select: {
                    name: 1,
                    email: 1
                },
                model: Faculty
            }
        };
        student = await Student.findByIdAndUpdate(studentID, {projects_preference: project_idArr}, {new: true}).select("-google_id -date -__v").populate(populator);
        const answer = student.projects_preference.map((val) => {
                return {
                    _id: val._id,
                    title: val.title,
                    description: val.description,
                    duration: val.duration,
                    studentIntake: val.studentIntake,
                    faculty_name: val.faculty_id.name,
                    faculty_email: val.faculty_id.email
                };
            }
        );
        res.json({message: "success", result: answer});
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// append multiple projects to existing preferences
router.post("/append/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let projects = req.body;
        const project_idArr = projects;
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        let updateResult = {
            $push: {projects_preference: {$each: project_idArr}}
        };
        await Student.findByIdAndUpdate(student._id, updateResult);
        const studentStream = student.stream;
        const studentID = student._id;
        const updateCondition = {
            stream: studentStream,
            _id: {$in: project_idArr}
        };
        updateResult = {
            $addToSet: {students_id: studentID},
            $pull: {not_students_id: studentID}
        };
        await Project.updateMany(updateCondition, updateResult);
        projects = await Project.find(updateCondition).populate({
            path: "students_id",
            select: "_id gpa",
            model: Student
        });
        if (obj.toSort) {
            let promises = [];
            for (let project of projects) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            await Promise.all(promises);
        }
        res.json({message: "success"});
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// remove a project from preferences
router.post("/remove/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const project = req.body.preference;
        let updateResult = {
            $pull: {projects_preference: project}
        };
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        let studentID = student._id;
        let _id = mongoose.Types.ObjectId(project);
        await Student.findByIdAndUpdate(student._id, updateResult);
        updateResult = {
            $pull: {students_id: studentID},
            $addToSet: {not_students_id: studentID}
        };
        await Project.findByIdAndUpdate(_id, updateResult);
        let projects = await Project.findById(_id).populate({
            path: "not_students_id",
            select: "_id gpa",
            model: Student
        });

        if (obj.toSort) {
            let promises = [];
            for (let project of [projects]) {
                project.not_students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            await Promise.all(promises);
        }
        res.json({message: "success"});
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// add a project to exising preferencces
router.post("/add/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let project = req.body.preference;
        let updateResult = {
            $push: {projects_preference: project}
        };
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        await Student.findByIdAndUpdate(student._id, updateResult);
        let _id = mongoose.Types.ObjectId(project);
        updateResult = {
            $pull: {not_students_id: student._id},
            $addToSet: {students_id: student._id}
        };
        await Project.findByIdAndUpdate(_id, updateResult);
        let projects = await Project.findById(_id).populate({path: "students_id", select: "_id gpa", model: Student});
        if (obj.toSort) {
            let promises = [];
            for (let project of [projects]) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            await Promise.all(promises);
        }
        res.json({message: "success"});
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// test if the projects and students collections tally.
router.get("/assert/order", async (req, res) => {
    try {
        let students = await Student.find({
            stream: "UGCSE",
            isRegistered: true
        }).lean().select("_id name gpa roll_no").sort([["gpa", -1]]);
        let projects = await Project.find({stream: "UGCSE"}).lean().populate({
            path: "students_id",
            select: "_id name gpa roll_no",
            model: Student
        }).populate({
            path: "not_students_id",
            select: "_id name gpa roll_no",
            model: Student
        });
        let a = students.map(val => val._id.toString());
        let ans = {};
        let overall = true;
        for (let project of projects) {
            ans[project._id] = [true, true, true];
            let so = project.students_id.sort((a, b) => b.gpa - a.gpa);
            let sno = project.not_students_id.sort((a, b) => b.gpa - a.gpa);
            so = so.map(value => value._id.toString());
            sno = sno.map(value => value._id.toString());
            if (so.length + sno.length !== a.length) {
                ans[project._id][2] = false;
                overall = false;
            }
            if (!isSubsequence(a, so)) {
                ans[project._id][0] = false;
                overall = false;
            }
            if (!isSubsequence(a, sno)) {
                ans[project._id][1] = false;
                overall = false;
            }
        }
        res.json({overall, ans});
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

module.exports = router;
