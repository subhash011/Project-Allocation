const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const Programs = require("../models/Programs");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

router.post("/register/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const user = req.body;
        await oauth(idToken);
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
        res.json({
            registration: "success"
        });
    } catch (e) {
        res.json({
            registration: "fail"
        });
    }
});

router.get("/details/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("-google_id -date");
        if (faculty) {
            res.json({
                status: "success",
                user_details: faculty
            });
        } else {
            res.json({
                status: "fail",
                user_details: ""
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            user_details: e
        });
    }
});

router.post("/set_programs/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const programs = req.body.programs;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty) {
            const streamMap = new Map(programs);

            const curPrograms = faculty.programs;

            if (curPrograms && curPrograms.length > 0) {
                for (const program of curPrograms) {
                    if (streamMap.has(program.short)) {
                        streamMap.delete(program.short);
                    }
                }
            }

            streamMap.forEach(function (value, key) {
                const obj = {
                    full: value,
                    short: key
                };
                faculty.programs.push(obj);
            });

            await faculty.save();
            res.json({
                status: "success",
                msg: "Successfully added the programs"
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/updateProfile/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const name = req.body.name;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty) {
            faculty.name = name;
            await faculty.save();
            res.json({
                status: "success",
                msg: "Successfully updated the profile!!"
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/getAllPrograms/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (faculty) {
            let programs = await Programs.find().lean();
            if (programs) {
                res.json({
                    status: "success",
                    programs: programs
                });
            } else {
                res.json({
                    status: "fail",
                    result: null
                });
            }
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
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
        if (faculty) {
            let projects = await Project.find({faculty_id: faculty._id, stream: curr_program.short});
            const project_ids = projects.map(project => project._id);
            await Project.deleteMany({faculty_id: faculty._id, stream: curr_program.short});
            updateConfig = {
                $pullAll: {projects_preference: project_ids}
            };
            await Student.updateMany({stream: curr_program.short}, updateConfig);
            res.json({
                status: "success",
                msg: "Successfully removed the program."
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/getFacultyPrograms/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("programs");
        if (faculty) {
            const programs = faculty.programs;
            res.json({
                status: "success",
                programs: programs
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/getFacultyProgramDetails/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const program = req.body.program;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        let admin = await Admin.findOne({stream: program.short}).lean();
        let deadline;
        if (admin) {
            if (admin.deadlines.length) {
                deadline = admin.deadlines[admin.deadlines.length - 1];
            } else {
                deadline = null;
            }
            let projects = await Project.find({faculty_id: faculty._id, stream: program.short})
                .populate({path: "student_alloted", select: "-google_id -date", model: Student});
            const obj = {
                program: program,
                admin: admin,
                curDeadline: deadline,
                projects: projects
            };

            res.json({
                status: "success",
                program_details: obj
            });
        } else {
            if (faculty) {
                let projects = await Project.find({faculty_id: faculty._id, stream: program.short})
                    .populate({path: "student_alloted", select: "-google_id -date", model: Student});
                const obj = {
                    program: program,
                    projects: projects
                };
                res.json({
                    status: "success",
                    program_details: obj
                });
            } else {
                res.json({
                    status: "fail",
                    result: null
                });
            }
        }
    } catch (e) {
        res.json({
            status: "Faculty not found",
            result: null
        });
    }
});

router.post("/getAdminInfo_program/:id", async (req, res) => {
    try {
        const program = req.body.program;
        let admin = await Admin.findOne({stream: program}).lean();
        if (admin) {
            res.json({
                status: "success",
                admin: admin
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/home/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}})
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
        if (!facultyData) {
            res.json({
                message: "invalid-token"
            });
            return;
        }
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
        res.json({
            message: "success",
            projects: facultyProjects,
            stageDetails: stageDetails
        });
    } catch (e) {
        res.json({
            message: "error"
        });
    }
});

module.exports = router;     
