const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
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

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then(() => {
        const newUser = new SuperAdmin({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken,
            },
            email: user.email,
        });
        newUser
            .save()
            .then(() => {
                res.json({
                    registration: "success",
                });
            })
            .catch(() => {
                res.json({
                    registration: "fail",
                });
            });
    });
});

router.get("/student/details/:id", (req, res) => {
    const student = {};
    const id = req.params.id;
    const idToken = req.headers.authorization;
    let branches = [];
    Mapping.find()
        .lean()
        .then((maps) => {
            branches = maps.map((val) => val.short);
            for (const branch of branches) {
                student[branch] = [];
            }
        })
        .then(() => {
            SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
                .lean()
                .select("_id")
                .then((user) => {
                    if (user) {
                        Student.find()
                            .lean()
                            .select(
                                "-google_id -date -__v -projects_preference -project_alloted"
                            )
                            .then((students) => {
                                if (students) {
                                    for (const branch of branches) {
                                        let temp = students.filter((student) => {
                                            return student.stream === branch;
                                        });
                                        temp = temp.map((val) => {
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
                                        student[branch] = temp;
                                    }
                                    res.json({
                                        message: "success",
                                        result: student,
                                    });
                                } else {
                                    res.json({
                                        message: "success",
                                        result: "no-students",
                                    });
                                }
                            })
                            .catch(() => {
                                res.status(500);
                            });
                    } else {
                        res.json({
                            message: "invalid-token",
                            result: null,
                        });
                    }
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.get("/faculty/details/:id", (req, res) => {

    const id = req.params.id;
    const faculty = {};
    let branches = [];
    const idToken = req.headers.authorization;
    Mapping.find()
        .lean()
        .then((maps) => {
            branches = maps.map((val) => val.short);
            for (const branch of branches) {
                faculty[branch] = [];
            }
        })
        .then(() => {
            SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
                .lean()
                .select("_id")
                .then((user) => {
                    if (user) {
                        Faculty.find()
                            .lean()
                            .select("-google_id -date -__v -project_list")
                            .then((faculties) => {
                                if (faculties) {
                                    for (const branch of branches) {
                                        let temp = faculties.filter((faculty) => {
                                            let arr = faculty.programs.map((x) => x.short);
                                            return arr.contains(branch);
                                        });
                                        temp = temp.map((val) => {
                                            return {
                                                _id: val._id,
                                                name: val.name,
                                                email: val.email,
                                                stream: val.stream,
                                                isAdmin: val.isAdmin,
                                                adminProgram: val.adminProgram,
                                            };
                                        });
                                        faculty[branch] = temp;
                                    }
                                    res.json({
                                        message: "success",
                                        result: faculty,
                                    });
                                } else {
                                    res.json({
                                        message: "success",
                                        result: "no-faculties",
                                    });
                                }
                            })
                            .catch(() => {
                                res.status(500);
                            });
                    } else {
                        res.json({
                            message: "invalid-token",
                            result: null,
                        });
                    }
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.delete("/student/:id", (req, res) => {
    const id = mongoose.Types.ObjectId(req.headers.body);
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({
        google_id: { id: google_user_id, idToken: idToken },
    })
        .lean()
        .select("_id")
        .then((user) => {
            if (user) {
                Student.findByIdAndDelete(id).then((student) => {
                    const updateCondition = {
                        $pullAll: {students_id: [id], not_students_id: [id], student_alloted: [id]},
                    };
                    Project.updateMany({stream: student.stream}, updateCondition).then(() => {
                        res.json({
                            message: "success",
                            result: null,
                        });
                    });
                });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        });
})

router.delete("/faculty/:id", (req, res) => {
    const id = mongoose.Types.ObjectId(req.headers.body);
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({
        google_id: { id: google_user_id, idToken: idToken },
    })
        .lean()
        .select("_id")
        .then((user) => {
            if (user) {
                Faculty.findByIdAndDelete(id).then((faculty) => {
                    const projectList = faculty.project_list;
                    Project.deleteMany({ _id: { $in: projectList } }).then(() => {
                        let updateResult = {
                            $pullAll: {
                                projects_preference: projectList,
                            },
                        };
                        Student.updateMany({}, updateResult).then(() => {
                            const updateCondition = {
                                project_alloted: {$in: projectList},
                            };
                            updateResult = { $unset: { project_alloted: "" } };
                            Student.updateMany(updateCondition, updateResult).then(() => {
                                res.json({
                                    message: "success",
                                    result: null,
                                });
                            });
                        });
                    });
                });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        });
});

router.post("/addAdmin/:id", (req, res) => {
    const id = req.body.id;
    const branch = req.body.branch;
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({
        google_id: { id: google_user_id, idToken: idToken },
    })
        .lean()
        .select("_id")
        .then((user) => {
            if (user) {
                Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
                    isAdmin: true,
                    adminProgram: branch,
                })
                    .then((faculty) => {
                        if (faculty) {
                            const admin = new Admin({
                                admin_id: faculty._id,
                                stream: branch,
                                deadlines: [],
                            });
                            admin
                                .save()
                                .then(() => {
                                    res.json({
                                        message: "success",
                                        result: faculty.isAdmin,
                                    });
                                })
                                .catch(() => {
                                    res.json({
                                        message: "error",
                                        result: null,
                                    });
                                });
                        } else {
                            res.json({
                                message: "success",
                                result: "no-faculty",
                            });
                        }
                    })
                    .catch(() => {
                        res.status(500);
                    });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        });
});

router.post("/removeAdmin/:id", (req, res) => {
    const id = req.body.id;
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({
        google_id: { id: google_user_id, idToken: idToken },
    })
        .lean()
        .select("_id")
        .then((user) => {
            if (user) {
                Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
                    isAdmin: false,
                    $unset: { adminProgram: 1 },
                })
                    .then((faculty) => {
                        if (faculty) {
                            Admin.findOneAndDelete({
                                admin_id: faculty._id,
                            }).then(() => {
                                res.json({
                                    message: "success",
                                    result: faculty.adminProgram,
                                });
                            });
                        } else {
                            res.json({
                                message: "success",
                                result: "no-faculty",
                            });
                        }
                    })
                    .catch(() => {
                        res.status(500);
                    });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        });
})

router.get("/projects/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
        .lean()
        .select("_id")
        .then((user) => {
            if (user) {
                Project.find()
                    .lean()
                    .populate({
                        path: "faculty_id",
                        select: { name: 1, _id: 1 },
                        model: Faculty,
                    })
                    .populate({
                        path: "student_alloted",
                        select: { name: 1, roll_no: 1 },
                        model: Student,
                    })
                    .then((projects) => {
                        const arr = [];
                        for (const project of projects) {
                            const newProj = {
                                title: project.title,
                                stream: project.stream,
                                duration: project.duration,
                                faculty: project.faculty_id.name,
                                numberOfPreferences: project.students_id.length,
                                description:project.description,
                                faculty_id: project.faculty_id._id,
                            };
                            arr.push(newProj);
                        }
                        res.json({
                            message: "success",
                            result: arr,
                        });
                    })
                    .catch(() => {
                        res.status(500);
                    });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        });
});

router.post("/create/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
        (user) => {
            if (user) {
                const newElement = new Mapping(req.body);
                newElement
                    .save()
                    .then((ele) => {
                        if (ele) {
                            res.json({
                                message: "success",
                                result: ele,
                            });
                        } else {
                            res.json({
                                message: "error",
                                result: null,
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            message: "error",
                            result: null,
                        });
                    });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        })
});

router.post("/edit/:field/:id",(req,res) => {
    const field = req.params.field;
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curVal = req.body.curVal;
    const newVal = req.body.newVal;
    SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(user => {
        if(user) {
            switch (field) {
                case "programShort":
                    Mapping.findOneAndUpdate({short:curVal},{short:newVal}).then(map => {
                        const newMap = {
                            full: map.full,
                            short: newVal
                        };
                        const curMap = {
                            full: map.full,
                            short: map.short
                        };
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
                        promises.push(
                            Faculty.updateMany(findCondition, updateCondition,filterCondition).then(faculties => {
                                return faculties;
                            })
                        );
                        promises.push(
                            Faculty.updateMany({adminProgram:curVal},{adminProgram:newVal}).then(faculties => {
                                return faculties;
                            })
                        )
                        promises.push(
                            Student.updateMany({stream:curVal},{stream:newVal}).then(students => {
                                return students;
                            })
                        );
                        promises.push(
                            Project.updateMany({stream:curVal},{stream:newVal}).then(projects => {
                                return projects;
                            })
                        );
                        promises.push(
                            Admin.updateMany({stream:curVal},{stream:newVal}).then(admin => {
                                return admin;
                            })
                        )
                        Promise.all(promises).then(() => {
                            res.json({
                                message:"success"
                            })
                        }).catch(() => {
                            res.json({
                                message:"error"
                            })
                        })
                    }).catch(() => {
                        res.json({
                            message:"error"
                        })
                    });
                    break;
                case "programFull":
                    Mapping.findOneAndUpdate({full:curVal},{full:newVal},{upsert:false,new:false}).then(map => {
                        const newMap = {
                            full: newVal,
                            short: map.short
                        };
                        const curMap = {
                            full: map.full,
                            short: map.short
                        };
                        const findCondition = {
                            programs: {$elemMatch: curMap}
                        };
                        const updateCondition = {
                            $set: {"programs.$[filter]": newMap}
                        };
                        const filterCondition = {
                            arrayFilters: [{"filter": curMap}]
                        };
                        Faculty.updateMany(findCondition,updateCondition,filterCondition).then(() => {
                            res.json({
                                message:"success",
                                result:null
                            })
                        }).catch(() => {
                            res.json({
                                message:"error"
                            })
                        })
                    }).catch(() => {
                        res.json({
                            message:"error"
                        })
                    });
                    break;
                case "streamShort":
                    Streams.findOneAndUpdate({short:curVal},{short:newVal}).then(() => {
                        Faculty.updateMany({stream:curVal},{stream:newVal}).then(() => {
                            res.json({
                                message:"success"
                            })
                        }).catch(() => {
                            res.json({
                                message:"error"
                            })
                        })
                    }).catch(() => {
                        res.json({
                            message:"error"
                        })
                    });
                    break;
                case "streamFull":
                    Streams.findOneAndUpdate({full:curVal},{full:newVal}).then(() => {
                        res.json({
                            message:"success"
                        })
                    }).catch(() => {
                        res.json({
                            message:"error"
                        })
                    });
                    break;
                default:
                    break;
            }
        } else {
            res.json({
                message:"invalid-token",
                result:null
            })
        }
    })
})

module.exports = router;
