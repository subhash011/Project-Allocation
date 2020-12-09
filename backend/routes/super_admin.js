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
const oauth = require("../config/oauth");

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
        if (user) {
            let students = await Student.find().lean().select("-google_id -date -__v -projects_preference -project_alloted");
            if (students) {
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
                            isRegistered: val.isRegistered,
                        };
                    });
                }
                res.json({
                    message: "success",
                    result: allStudents,
                });
            } else {
                res.json({
                    message: "success",
                    result: "no-students",
                });
            }
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
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
        if(user) {
            let faculties = await Faculty.find().lean().select("-google_id -date -__v -project_list");
            if (faculties) {
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
                            adminProgram: val.adminProgram,
                        };
                    });
                }
                res.json({
                    message: "success",
                    result: allFaculties,
                });
            } else {
                res.json({
                    message: "success",
                    result: "no-faculties",
                });
            }
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
        });
    }
});

router.get("/projects/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    try {
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id")
        if (user) {
            let popFac = {
                path: "faculty_id",
                select: {name: 1, _id: 1},
                model: Faculty,
            };
            let popStud = {
                path: "student_alloted",
                select: {name: 1, roll_no: 1},
                model: Student,
            }
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
                    faculty_id: project.faculty_id._id,
                };
                arr.push(newProj);
            }
            res.json({
                message: "success",
                result: arr,
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
        });
    }
});

router.post("/register/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const user = req.body;
        await oauth(idToken);
        const newUser = new SuperAdmin({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken,
            },
            email: user.email,
        });
        await newUser.save()
        res.json({
            registration: "success",
        });
    } catch (e) {
        res.json({
            registration: "fail",
        });
    }
});

router.post("/addAdmin/:id", async (req, res) => {
    try {
        const id = req.body.id;
        const program = req.body.branch;
        const google_user_id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: google_user_id, idToken: idToken}}).lean().select("_id")
        if (user) {
            let faculty = await Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(id), {isAdmin: true, adminProgram: program});
            if (faculty) {
                const admin = new Admin({
                    admin_id: faculty._id,
                    stream: program,
                    deadlines: [],
                });
                await admin.save();
                res.json({
                    message: "success",
                    result: faculty.isAdmin,
                });
            } else {
                res.json({
                    message: "success",
                    result: "no-faculty",
                });
            }
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        console.log(e);
        res.json({
            message: "invalid-token",
            result: null,
        });
    }
});

router.post("/removeAdmin/:id", async (req, res) => {
    try {
        const adminId = req.body.id;
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id")
        if (user) {
            let faculty = Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(adminId), {isAdmin: false, $unset: {adminProgram: 1}});
            if (faculty) {
                await Admin.findOneAndDelete({
                    admin_id: faculty._id,
                });
                res.json({
                    message: "success",
                    result: faculty.adminProgram,
                });
            } else {
                res.json({
                    message: "success",
                    result: "no-faculty",
                });
            }
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
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
        if (user) {
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
            promises.push(Faculty.updateMany({adminProgram: curMap.short}, {adminProgram: newMap.short}))
            promises.push(Student.updateMany({stream: curMap.short}, {stream: newMap.short}));
            promises.push(Project.updateMany({stream: curMap.short}, {stream: newMap.short}));
            promises.push(Admin.updateMany({stream: curMap.short}, {stream: newMap.short}));
            await Promise.all(promises);
            res.json({
                message: "success"
            })
        } else {
            res.json({
                message: "invalid-token",
                result: null
            })
        }
    } catch (e) {
        res.json({
            message: "error"
        })
    }
})

router.post("/update/stream/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curMap = req.body.curMap;
    const newMap = req.body.newMap;
    try {
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}});
        if (user) {
            let promises = [];
            promises.push(Streams.findOneAndUpdate({short: curMap.short}, newMap));
            promises.push(Faculty.updateMany({stream: curMap.short}, {stream: newMap.short}));
            await Promise.all(promises);
            res.json({
                message: "success"
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            })
        }
    } catch (e) {
        res.json({
            message: "error"
        })
    }
})

router.delete("/student/:id", async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.headers.body);
        const google_user_id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: google_user_id, idToken: idToken}}).lean().select("_id");
        if (user) {
            let student = await Student.findByIdAndDelete(id);
            const updateCondition = {
                $pullAll: {students_id: [id], not_students_id: [id], student_alloted: [id]},
            };
            await Project.updateMany({stream: student.stream}, updateCondition);
            res.json({
                message: "success",
                result: null,
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
        });
    }
});

router.delete("/faculty/:id", async (req, res) => {
    try {
        const id = mongoose.Types.ObjectId(req.headers.body);
        const google_user_id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: google_user_id, idToken: idToken}}).lean().select("_id");
        if (user) {
            let faculty = await Faculty.findByIdAndDelete(id);
            const projectList = faculty.project_list;
            await Project.deleteMany({_id: {$in: projectList}})
            let updateResult = {
                $pullAll: {
                    projects_preference: projectList,
                },
            };
            await Student.updateMany({}, updateResult);
            const updateCondition = {
                project_alloted: {$in: projectList},
            };
            updateResult = {$unset: {project_alloted: ""}};
            await Student.updateMany(updateCondition, updateResult);
            res.json({
                message: "success",
                result: null,
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null,
        });
    }
});

module.exports = router;
