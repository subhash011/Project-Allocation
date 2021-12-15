const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const Programs = require("../models/Programs");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const oauth = require("../commons/oauth");

router.post("/register/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const user = req.body;
        let authUser = await oauth(idToken);
        if (!authUser) {
            res.status(200).json({
                statusCode: 200,
                message: "Registration failed! Please try again",
                result: {
                    registered: false
                }
            });
            return;
        }
        const newUser = new Faculty({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken
            },
            email: user.email,
            stream: user.stream,
            isAdmin: false
        });
        await newUser.save();
        res.status(200).json({
            statusCode: 200,
            message: "Registration Successful",
            result: {
                registered: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.get("/details/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("-google_id -date");
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                faculty
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.post("/set_programs/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const programs = req.body.programs.map((val) => {
            return {
                full: val[1],
                short: val[0]
            };
        });
        const updateCond = {
            $addToSet: {programs: programs}
        };
        let faculty = await Faculty.findOneAndUpdate({google_id: {id: id, idToken: idToken}}, updateCond, {new: true});
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: "Successfully added the programs",
            result: {
                updated: true,
                programs: faculty.programs
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.post("/updateProfile/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const name = req.body.name;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        faculty.name = name;
        await faculty.save();
        res.status(200).json({
            statusCode: 200,
            message: "Successfully updated your profile.",
            result: {
                updated: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.get("/getAllPrograms/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let programs = await Programs.find().lean();
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                programs
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.post("/deleteProgram/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const curr_program = req.body.program;

        let updateConfig = {
            $pull: {programs: curr_program}
        };

        let faculty = await Faculty.findOneAndUpdate({google_id: {id: id, idToken: idToken}}, updateConfig);
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let projects = await Project.find({faculty_id: faculty._id, stream: curr_program.short});
        const project_ids = projects.map(project => project._id);
        await Project.deleteMany({faculty_id: faculty._id, stream: curr_program.short});
        updateConfig = {
            $pullAll: {projects_preference: project_ids}
        };
        await Student.updateMany({stream: curr_program.short}, updateConfig);
        res.status(200).json({
            statusCode: 200,
            message: "Removed the program along with all your projects in that program.",
            result: {
                deleted: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.get("/getFacultyPrograms/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("programs");
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        const programs = faculty.programs;
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                programs
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.post("/getAdminInfo_program/:id", async (req, res) => {
    try {
        const program = req.body.program;
        let admin = await Admin.findOne({stream: program}).lean();
        if (admin && admin.admin_id) {
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    adminPresent: true,
                    admin
                }
            });
        } else {
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    adminPresent: false
                }
            });
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

router.get("/home/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty
            .findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("-google_id")
            .populate({
                path: "project_list",
                select: "students_id student_alloted title studentIntake description duration stream",
                model: Project,
                populate: {
                    path: "student_alloted",
                    select: "name roll_no",
                    model: Student
                }
            });
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let facultyPrograms = faculty.programs.map(val => val.short);
        let facultyProjects = faculty.project_list;
        facultyProjects = facultyProjects.map(val => {
            return {
                title: val.title,
                studentIntake: val.studentIntake,
                noOfPreferences: val.students_id.length,
                student_alloted: val.student_alloted,
                stream: val.stream
            };
        });
        facultyProjects.sort((a, b) => {
            return a.stream.localeCompare(b.stream);
        });
        let facultyData = {
            facultyPrograms: facultyPrograms,
            facultyProjects: facultyProjects
        };
        facultyProjects = facultyData.facultyProjects;
        facultyPrograms = facultyData.facultyPrograms;
        let admins = await Admin.find({stream: {$in: facultyPrograms}}).lean().select("deadlines stream stage");
        let stageDetails = admins.map(val => {
            return {
                deadlines: val.deadlines,
                stream: val.stream,
                stage: val.stage
            };
        });
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                projects: facultyProjects,
                stageDetails: stageDetails
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

module.exports = router;     
