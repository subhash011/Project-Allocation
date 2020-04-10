const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
const oauth = require("../config/oauth");
const Service = require("../helper/serivces");
var branches = Service.branches;
Array.prototype.contains = function(v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i]) && this[i] != "") {
            arr.push(this[i]);
        }
    }
    return arr;
};

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then((response) => {
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
            .then((result) => {
                res.json({
                    registration: "success",
                });
            })
            .catch((err) => {
                res.json({
                    registration: "fail",
                });
            });
    });
});

router.get("/student/details/:id", (req, res) => {
    var streamwise = [];
    var student = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
                (user) => {
                    if (user) {
                        Student.find()
                            .then((students) => {
                                if (students) {
                                    for (const branch of branches) {
                                        var temp = students.filter((student) => {
                                            return student.stream == branch;
                                        });
                                        streamwise.push(temp);
                                    }
                                    res.json({
                                        message: "success",
                                        result: streamwise,
                                    });
                                } else {
                                    res.json({
                                        message: "success",
                                        result: "no-students",
                                    });
                                }
                            })
                            .catch((err) => {
                                res.status(500);
                            });
                    } else {
                        res.json({
                            message: "invalid-token",
                            result: null,
                        });
                    }
                }
            );
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.get("/faculty/details/:id", (req, res) => {
    var streamwise = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
                (user) => {
                    if (user) {
                        Faculty.find()
                            .then((faculties) => {
                                if (faculties) {
                                    for (const branch of branches) {
                                        var temp = faculties.filter((faculty) => {
                                            return faculty.stream == branch;
                                        });
                                        streamwise.push(temp);
                                    }
                                    res.json({
                                        message: "success",
                                        result: streamwise,
                                    });
                                } else {
                                    res.json({
                                        message: "success",
                                        result: "no-faculties",
                                    });
                                }
                            })
                            .catch((err) => {
                                res.status(500);
                            });
                    } else {
                        res.json({
                            message: "invalid-token",
                            result: null,
                        });
                    }
                }
            );
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.delete("/student/:id", (req, res) => {
    //start authentication here
    const id = mongoose.Types.ObjectId(req.headers.body);
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({
                google_id: { id: google_user_id, idToken: idToken },
            }).then((user) => {
                if (user) {
                    var promises = [];
                    Student.findByIdAndDelete(id)
                        .then((student) => {
                            if (student) return student.projects_preference;
                            else return null;
                        })
                        .then((projects) => {
                            if (projects) {
                                for (const project of projects) {
                                    var projectid = mongoose.Types.ObjectId(project);
                                    promises.push(
                                        Project.findById(projectid).then((project) => {
                                            project.students_id = project.students_id.filter(
                                                (val) => !val.equals(id)
                                            );
                                            project.save().then((project) => {
                                                return project;
                                            });
                                        })
                                    );
                                }
                                Promise.all(promises).then((result) => {
                                    res.json({ result: result, message: "success" });
                                });
                            } else {
                                res.json({ message: "error" });
                            }
                        })
                        .catch((err) => {
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

router.delete("/faculty/:id", (req, res) => {
    const id = mongoose.Types.ObjectId(req.headers.body);
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({
                google_id: { id: google_user_id, idToken: idToken },
            }).then((user) => {
                if (user) {
                    Faculty.findByIdAndDelete(id).then((faculty) => {
                        if (!faculty) {
                            res.json({ result: "no-faculty", message: "success" });
                            return;
                        }
                        var projects = faculty.project_list;
                        var promises = [];
                        for (const project of projects) {
                            var project_id = mongoose.Types.ObjectId(project);
                            promises.push(
                                Project.findByIdAndDelete(project_id).then((project) => {
                                    return project;
                                })
                            );
                        }
                        Promise.all(promises)
                            .then((result) => {
                                return result;
                            })
                            .catch((err) => {
                                res.status(500);
                            })
                            .then((projects) => {
                                promises = [];
                                projects_id = projects.map((val) => String(val._id));
                                students_id = projects.map((val) => val.students_id);
                                var students = [];
                                for (const ids of students_id) {
                                    var studentid = [String(ids)];
                                    students = [...students, ...studentid];
                                }
                                students_id = students.unique();
                                for (const student of students_id) {
                                    studentID = mongoose.Types.ObjectId(student);
                                    promises.push(
                                        Student.findById(studentID).then((student) => {
                                            student.projects_preference = student.projects_preference.filter(
                                                (val) => !projects_id.includes(String(val))
                                            );
                                            student.projects_preference.map((val) =>
                                                mongoose.Types.ObjectId(val)
                                            );
                                            student.save().then((student) => {
                                                return student;
                                            });
                                            return student._id;
                                        })
                                    );
                                }
                                Promise.all(promises)
                                    .then((result) => {
                                        res.json({ result: result, message: "success" });
                                    })
                                    .catch((err) => {
                                        res.status(500);
                                    });
                            })
                            .catch((err) => {
                                res.status(500);
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
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.post("/addAdmin/:id", (req, res) => {
    const id = req.body.id;
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({
                google_id: { id: google_user_id, idToken: idToken },
            }).then((user) => {
                if (user) {
                    Faculty.findById(id)
                        .then((faculty) => {
                            if (faculty) {
                                faculty.isAdmin = true;
                                faculty.save().then((faculty) => {
                                    var admin = new Admin({
                                        admin_id: faculty._id,
                                        stream: faculty.stream,
                                        deadlines: [],
                                    });
                                    admin
                                        .save()
                                        .then((admin) => {
                                            //success here
                                        })
                                        .catch((err) => {
                                            res.json({
                                                message: "error",
                                                result: null,
                                            });
                                        });
                                });
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

router.post("/removeAdmin/:id", (req, res) => {
    const id = req.body.id;
    const google_user_id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({
                google_id: { id: google_user_id, idToken: idToken },
            }).then((user) => {
                if (user) {
                    Faculty.findById(id)
                        .then((faculty) => {
                            if (faculty) {
                                faculty.isAdmin = false;
                                faculty.save().then((faculty) => {
                                    Admin.findOneAndDelete({ admin_id: faculty._id }).then(
                                        (admin) => {
                                            // console.log(admin);
                                        }
                                    );
                                });
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

router.get("/projects/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
                (user) => {
                    if (user) {
                        Project.find()
                            .populate("faculty_id")
                            .populate("student_alloted")
                            .then((projects) => {
                                var arr = [];
                                for (const project of projects) {
                                    const newProj = {
                                        title: project.title,
                                        stream: project.stream,
                                        duration: project.duration,
                                        faculty: project.faculty_id.name,
                                        numberOfPreferences: project.students_id.length,
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
                }
            );
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.post("/create/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then(
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
                }
            )
        )
        .catch((err) => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

module.exports = router;