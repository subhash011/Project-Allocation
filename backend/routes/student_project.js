const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
const { STAGES } = require("../commons/constants");

async function canUpdateProject(res, idToken, id) {
    try {
        let student = await Student.findOne({ google_id: { id: id, idToken: idToken } })
            .lean().select("_id stream");
        if (!student) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return false;
        }
        let admin = await Admin.findOne({stream: student.stream})
            .lean().select("stage maxStage");
        if (admin.stage !== STAGES.STUDENT_PREFERENCES) {
            res.status(200).json({
                statusCode: 200,
                message: "You cannot edit preferences now.",
                result: {
                    updated: false
                }
            });
            return false;
        }
        return {
            student: student,
            toSort: admin.maxStage > STAGES.STUDENT_PREFERENCES
        };
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
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

// fetch all non opted projects
router.get("/not_preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let populator = {
            path: "faculty_id",
            select: {
                name: 1,
                email: 1
            },
            model: Faculty
        };
        let student = await Student.findOne({ google_id: { id: id, idToken: idToken } })
            .lean().select("projects_preference stream");
        if (!student) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        const findCondition = {
            _id: { $nin: student.projects_preference },
            stream: student.stream
        };
        let notOptedProjects = await Project.find(findCondition).populate(populator);
        notOptedProjects = notOptedProjects.map(val => {
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
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                not_preferences: notOptedProjects
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        let student = await Student.findOne({ google_id: { id: id, idToken: idToken } }).lean().populate(populator);
        if (!student) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
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
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                preferences: studPrefs
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// add projects to preferences
router.post("/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const projectIds = req.body;

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
        student = await Student.findByIdAndUpdate(
            studentID, { projects_preference: projectIds }, { new: true }
        )
            .select("-google_id -date -__v").populate(populator);

        await Project.bulkWrite([
            {
                updateMany: {
                    filter: { _id: { $in: projectIds }, students_id: { $ne: studentID } },
                    update: { $push: { students_id: studentID } }
                }
            },
            {
                updateMany: {
                    filter: { _id: { $in: projectIds } },
                    update: { $pull: { not_students_id: studentID } }
                }
            },
            {
                updateMany: {
                    filter: { _id: { $nin: projectIds }, not_students_id: { $ne: studentID } },
                    update: { $push: { not_students_id: studentID } }
                }
            },
            {
                updateMany: {
                    filter: { _id: { $nin: projectIds } },
                    update: { $pull: { students_id: studentID } }
                }
            }
        ]);
        const projects = await Project.find().populate({
            path: "not_students_id",
            select: "_id gpa",
            model: Student
        });
        if (obj.toSort) {
            let promises = [];
            for (let project of projects) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                project.not_students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            await Promise.all(promises);
        }
        const preferences = student.projects_preference.map((val) => {
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
        res.status(200).json({
            statusCode: 200,
            message: "Successfully added projects to your preferences.",
            result: {
                updated: true,
                preferences
            }
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// append multiple projects to existing preferences
router.post("/append/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const projectIds = req.body;
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        let updateResult = {
            $push: { projects_preference: { $each: projectIds } }
        };
        await Student.findByIdAndUpdate(student._id, updateResult);
        const studentID = student._id;
        await Project.bulkWrite([
            {
                updateMany: {
                    filter: { _id: { $in: projectIds } },
                    update: { $pull: { not_students_id: studentID } }
                }
            },
            {
                updateMany: {
                    filter: { _id: { $in: projectIds }, students_id: { $ne: studentID } },
                    update: { $push: { students_id: studentID } }
                }
            }
        ]);
        const projects = await Project.find({ _id: { $in: projectIds } }).populate({
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
        res.status(200).json({
            statusCode: 200,
            message: "Added projects to your preferences.",
            result: {
                updated: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// remove a project from preferences
router.post("/remove/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const projectId = req.body.preference;
        let updateResult = {
            $pull: { projects_preference: projectId }
        };
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        let studentID = student._id;
        await Student.findByIdAndUpdate(student._id, updateResult);
        await Project.bulkWrite([
            {
                updateOne: {
                    filter: { _id: projectId },
                    update: { $pull: { students_id: studentID } }
                }
            },
            {
                updateOne: {
                    filter: { _id: projectId, not_students_id: { $ne: studentID } },
                    update: { $push: { not_students_id: studentID } }
                }
            }
        ]);
        const projects = await Project.findById(projectId).populate({
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
        res.status(200).json({
            statusCode: 200,
            message: "Removed the project from preferences.",
            result: { updated: true }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// add a project to exising preferences
router.post("/add/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let project = req.body.preference;
        let updateResult = {
            $push: { projects_preference: project }
        };
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        await Student.findByIdAndUpdate(student._id, updateResult);
        let _id = mongoose.Types.ObjectId(project);
        await Project.bulkWrite([
            {
                updateOne: {
                    filter: { _id },
                    update: { $pull: { not_students_id: student._id } }
                }
            },
            {
                updateOne: {
                    filter: { _id, students_id: { $ne: student._id } },
                    update: { $push: { students_id: student._id } }
                }
            }
        ]);
        let projects = await Project.findById(_id).populate({ path: "students_id", select: "_id gpa", model: Student });
        if (obj.toSort) {
            let promises = [];
            for (let project of [projects]) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            await Promise.all(promises);
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                updated: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        let projects = await Project.find({ stream: "UGCSE" }).lean().populate({
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
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                overall,
                ans
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

module.exports = router;
