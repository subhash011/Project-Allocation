const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin_Info");
const Programs = require("../models/Programs");
const Streams = require("../models/Streams");
const oauth = require("../commons/oauth");

Array.prototype.contains = function (v) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function () {
    const arr = [];
    for (let i = 0; i < this.length; i++) {
        if (!arr.contains(this[i]) && this[i] !== "") {
            arr.push(this[i]);
        }
    }
    return arr;
};

router.get("/student/details/:id", async (req, res) => {

    try {
        const allStudents = {};
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let maps = await Programs.find().lean();
        let programs = maps.map((val) => val.short);
        for (const program of programs) {
            allStudents[program] = [];
        }
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let students = await Student.find().lean().select("-google_id -date -__v -projects_preference -project_alloted");
        if (!students) students = [];
        for (const program of programs) {
            allStudents[program] = students.filter((student) => {
                return student.stream === program;
            }).map((val) => {
                return {
                    _id: val._id,
                    name: val.name,
                    gpa: val.gpa,
                    stream: val.stream,
                    email: val.email,
                    roll_no: val.roll_no,
                    isRegistered: val.isRegistered
                };
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                students: allStudents
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

router.get("/faculty/details/:id", async (req, res) => {
    try {
        const allFaculties = {};
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let maps = await Programs.find().lean();
        let programs = maps.map((val) => val.short);
        for (const program of programs) {
            allFaculties[program] = [];
        }
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let faculties = await Faculty.find().lean().select("-google_id -date -__v -project_list");
        if (!faculties) faculties = [];
        for (const program of programs) {
            allFaculties[program] = faculties.filter((faculty) => {
                let arr = faculty.programs.map((x) => x.short);
                return arr.contains(program);
            }).map((val) => {
                return {
                    _id: val._id,
                    name: val.name,
                    email: val.email,
                    stream: val.stream,
                    isAdmin: val.isAdmin,
                    adminProgram: val.adminProgram
                };
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                faculties: allFaculties
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

router.get("/projects/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    try {
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let popFac = {
            path: "faculty_id",
            select: {name: 1, _id: 1},
            model: Faculty
        };
        let popStud = {
            path: "student_alloted",
            select: {name: 1, roll_no: 1},
            model: Student
        };
        let projects = await Project.find().lean().populate(popFac).populate(popStud);
        const arr = [];
        for (const project of projects) {
            const newProj = {
                title: project.title,
                stream: project.stream,
                duration: project.duration,
                faculty: project.faculty_id.name,
                numberOfPreferences: project.students_id.length,
                description: project.description,
                faculty_id: project.faculty_id._id
            };
            arr.push(newProj);
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                projects: arr
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
        const newUser = new SuperAdmin({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken
            },
            email: user.email
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

router.post("/addAdmin/:id", async (req, res) => {
    try {
        const facultyId = req.body.facultyId;
        const program = req.body.branch;
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let faculty = await Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(facultyId), {
            isAdmin: true,
            adminProgram: program
        });
        if (!faculty) {
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    updated: false
                }
            });
            return;
        }
        await Admin.findOneAndUpdate({stream: program}, {admin_id: faculty._id});
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

router.post("/removeAdmin/:id", async (req, res) => {
    try {
        const facultyId = req.body.adminId;
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let faculty = await Faculty.findByIdAndUpdate(facultyId, {
            isAdmin: false,
            $unset: {adminProgram: 1}
        });
        if (!faculty) {
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    updated: false
                }
            });
            return;
        }
        await Admin.findOneAndUpdate({admin_id: faculty._id}, {$unset: {admin_id: ""}});
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

router.post("/update/program/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curMap = req.body.curMap;
    const newMap = req.body.newMap;
    try {
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}});
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        await Programs.findOneAndUpdate({short: curMap.short}, newMap, {upsert: false, new: false});
        const findCondition = {
            programs: {$elemMatch: curMap}
        };
        const updateCondition = {
            $set: {"programs.$[filter]": newMap}
        };
        const filterCondition = {
            arrayFilters: [{"filter": curMap}]
        };
        const promises = [];
        promises.push(Faculty.updateMany(findCondition, updateCondition, filterCondition));
        promises.push(Faculty.updateMany({adminProgram: curMap.short}, {adminProgram: newMap.short}));
        promises.push(Student.updateMany({stream: curMap.short}, {stream: newMap.short}));
        promises.push(Project.updateMany({stream: curMap.short}, {stream: newMap.short}));
        promises.push(Admin.updateMany({stream: curMap.short}, {stream: newMap.short}));
        await Promise.all(promises);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully updated the program.",
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

router.post("/update/stream/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curMap = req.body.curMap;
    const newMap = req.body.newMap;
    try {
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}});
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let promises = [];
        promises.push(Streams.findOneAndUpdate({short: curMap.short}, newMap));
        promises.push(Faculty.updateMany({stream: curMap.short}, {stream: newMap.short}));
        await Promise.all(promises);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully updated the stream.",
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

router.delete("/student/:id", async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.headers.body);
        const google_user_id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: google_user_id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let student = await Student.findByIdAndDelete(id);
        const updateCondition = {
            $pullAll: {students_id: [id], not_students_id: [id], student_alloted: [id]}
        };
        await Project.updateMany({stream: student.stream}, updateCondition);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully removed the student.",
            result: {
                deleted: true
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

router.delete("/faculty/:id", async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.headers.body);
        const google_user_id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: google_user_id, idToken: idToken}}).lean().select("_id");
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let faculty = await Faculty.findByIdAndDelete(id);
        const projectList = faculty.project_list;
        await Project.deleteMany({_id: {$in: projectList}});
        let updateResult = {
            $pullAll: {
                projects_preference: projectList
            }
        };
        await Student.updateMany({}, updateResult);
        const updateCondition = {
            project_alloted: {$in: projectList}
        };
        updateResult = {$unset: {project_alloted: ""}};
        await Student.updateMany(updateCondition, updateResult);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully removed the faculty",
            result: {
                deleted: true
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
