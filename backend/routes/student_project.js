const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
const { STAGES, REORDER } = require("../commons/constants");

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
            student: student
        };
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: e.toString()
        });
    }
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
            result: e.toString()
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
            result: e.toString()
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
                    filter: { _id: { $nin: projectIds }, not_students_id: { $ne: studentID }, stream: student.stream },
                    update: { $push: { not_students_id: studentID } }
                }
            },
            {
                updateMany: {
                    filter: { _id: { $nin: projectIds }, stream: student.stream },
                    update: { $pull: { students_id: studentID } }
                }
            }
        ]);
        const projects = await Project.find({ stream: student.stream }).populate({
            path: "students_id",
            select: "_id gpa",
            model: Student
        });
        let promises = [];
        for (let project of projects) {
            if (project.reorder === REORDER.NONE)
                continue;
            if (project.reorder === REORDER.BOTH || project.reorder === REORDER.OPTED) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
            if (project.reorder === REORDER.BOTH || project.reorder === REORDER.NOT_OPTED) {
                project.not_students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
        }
        await Promise.all(promises);
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
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: e.toString()
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
        let promises = [];
        for (let project of projects) {
            if (project.reorder === REORDER.NONE)
                continue;
            if (project.reorder === REORDER.BOTH || project.reorder === REORDER.OPTED) {
                project.students_id.sort((a, b) => b.gpa - a.gpa);
                promises.push(project.save());
            }
        }
        await Promise.all(promises);
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
            result: e.toString()
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
        const project = await Project.findById(projectId).populate({
            path: "not_students_id",
            select: "_id gpa",
            model: Student
        });
        if (project.reorder === REORDER.NOT_OPTED || project.reorder === REORDER.BOTH) {
            project.not_students_id.sort((a, b) => b.gpa - a.gpa);
            await project.save();
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
            result: e.toString()
        });
    }
});

// add a project to exising preferences
router.post("/add/preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let projectId = req.body.preference;
        let updateResult = {
            $push: { projects_preference: projectId }
        };
        let obj = await canUpdateProject(res, idToken, id);

        if (!obj) {
            return;
        }

        let student = obj.student;
        await Student.findByIdAndUpdate(student._id, updateResult);
        let _id = mongoose.Types.ObjectId(projectId);
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
        const project = await Project.findById(projectId).populate({
            path: "not_students_id",
            select: "_id gpa",
            model: Student
        });
        if (project.reorder === REORDER.OPTED || project.reorder === REORDER.BOTH) {
            project.students_id.sort((a, b) => b.gpa - a.gpa);
            await project.save();
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
            result: e.toString()
        });
    }
});

module.exports = router;
