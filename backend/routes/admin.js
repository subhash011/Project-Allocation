const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const Service = require("../helper/serivces");
var branches = Service.branches;

router.get("/project/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
                (faculty) => {
                    if (faculty) {
                        Admin.findOne({ admin_id: faculty._id }).then((admin) => {
                            if (admin) {
                                const stream = admin.stream;
                                Project.find({ stream: stream })
                                    .populate("faculty_id")
                                    .populate("student_alloted")
                                    .then((projects) => {
                                        var arr = [];
                                        for (const project of projects) {
                                            const newProj = {
                                                title: project.title,
                                                description: project.description,
                                                stream: project.stream,
                                                duration: project.duration,
                                                faculty: project.faculty_id.name,
                                                numberOfPreferences: project.students_id.length,
                                                student_alloted: project.student_alloted,
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

router.get("/info/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
        (faculty) => {
            Admin.findOne({ admin_id: faculty._id })
                .then((admin) => {
                    if (admin) {
                        var startDate;
                        if (admin.deadlines.length) {
                            startDate = admin.startDate;
                        }

                        res.json({
                            status: "success",
                            stage: admin.stage,
                            deadlines: admin.deadlines,
                            startDate: startDate,
                            projectCap: admin.project_cap,
                            studentCap: admin.student_cap,
                            stream: admin.stream,
                            studentsPerFaculty: admin.studentsPerFaculty,
                        });
                    } else {
                        res.json({
                            status: "fail",
                            stage: 0,
                            deadlines: "",
                            startDate: startDate,
                        });
                    }
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        stage: 0,
                        deadlines: "",
                        startDate: startDate,
                    });
                });
        }
    );
});

router.post("/update_stage/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const stage = req.body.stage;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            Admin.findOne({ admin_id: faculty._id })
                .then((admin) => {
                    admin.stage = stage;

                    admin
                        .save()
                        .then((result) => {
                            res.json({
                                status: "success",
                                msg: "Successfully moved to the next stage",
                            });
                        })
                        .catch((err) => {
                            res.json({
                                status: "fail",
                                result: null,
                            });
                        });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.post("/setDeadline/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const date = req.body.deadline;

    const format_date = new Date(date);

    format_date.setHours(18);
    format_date.setMinutes(30);

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            Admin.findOne({ admin_id: faculty._id })
                .then((admin) => {
                    if (admin.deadlines.length == admin.stage + 1) {
                        admin.deadlines.pop();
                        admin.deadlines.push(format_date);
                    }

                    if (admin.stage == 0) {
                        admin.startDate = new Date();
                    }

                    if (admin.stage == admin.deadlines.length)
                        admin.deadlines.push(format_date);

                    admin
                        .save()
                        .then((result) => {
                            res.json({
                                status: "success",
                                msg: "Successfully set the deadline",
                            });
                        })
                        .catch((err) => {
                            res.json({
                                status: "fail",
                                result: null,
                            });
                        });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/stream_email/faculty/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const emails = [];

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            const stream = faculty.stream;

            Faculty.find({ stream: stream })
                .then((faculty) => {
                    for (const fac of faculty) {
                        emails.push(fac.email);
                    }

                    res.json({
                        status: "success",
                        result: emails,
                        stream: stream,
                    });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/stream_email/student/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const emails = [];

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            const stream = faculty.stream;

            Student.find({ stream: stream })
                .then((students) => {
                    for (const student of students) {
                        emails.push(student.email);
                    }

                    res.json({
                        status: "success",
                        result: emails,
                        stream: stream,
                    });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/all/info", (req, res) => {
    var result = {
        CSE: {},
        EE: {},
        ME: {},
        CE: {},
    };
    var promises = [];
    Admin.find().then((admins) => {
        if (admins) {
            for (const branch of branches) {
                promises.push(
                    Admin.findOne({ stream: branch })
                    .populate("admin_id")
                    .then((admin) => {
                        result[branch] = admin;
                        return admin;
                    })
                );
            }
            Promise.all(promises).then((prom) => {
                return res.json({
                    message: "success",
                    result: result,
                });
            });
        }
    });
});

router.get("/members/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    var promises = [];
    var users = {};
    Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
        if (admin && admin.isAdmin) {
            promises.push(
                Faculty.find({ stream: admin.stream }).then((faculties) => {
                    var temp = faculties.map((val) => {
                        var newFac = {
                            _id: val._id,
                            name: val.name,
                            //add number of programs here
                            noOfProjects: val.project_list.length,
                            email: val.email,
                        };
                        return newFac;
                    });
                    users.faculties = temp;
                    return users.faculties;
                })
            );
            promises.push(
                Student.find({ stream: admin.stream }).then((students) => {
                    var tempStudents = students.map((val) => {
                        var newStud = {
                            _id: val._id,
                            name: val.name,
                            email: val.email,
                            gpa: val.gpa,
                        };
                        return newStud;
                    });
                    users.students = tempStudents;
                    return users.students;
                })
            );
            Promise.all(promises)
                .then((result) => {
                    res.json({
                        message: "success",
                        result: users,
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
                message: "invalid-token",
                result: null,
            });
        }
    });
});

router.delete("/faculty/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const mid = req.headers.body;
    Admin.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
        if (admin) {
            Faculty.findByIdAndDelete(mongoose.Types.ObjectId(mid)).then(
                (faculty) => {
                    res.json({
                        message: "success",
                        result: null,
                    });
                }
            );
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    });
});

router.delete("/student/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const mid = req.headers.body;
    Admin.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
        if (admin) {
            Student.findByIdAndDelete(mongoose.Types.ObjectId(mid)).then(
                (student) => {
                    res.json({
                        message: "success",
                        result: null,
                    });
                }
            );
        } else {
            res.json({
                message: "invalid-token",
                result: null,
            });
        }
    });
});

router.post("/set_projectCap/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const cap = req.body.cap;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            Admin.findOne({ admin_id: faculty._id })
                .then((admin) => {
                    admin.project_cap = cap;

                    admin
                        .save()
                        .then((result) => {
                            res.json({
                                status: "success",
                                msg: "Successfully updated the project cap",
                            });
                        })
                        .catch((err) => {
                            res.json({
                                status: "fail",
                                result: "save error",
                            });
                        });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: "admin error",
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: "faculty error",
            });
        });
});

router.post("/set_studentCap/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const studentCap = req.body.cap;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            Admin.findOne({ admin_id: faculty._id })
                .then((admin) => {
                    admin.student_cap = studentCap;
                    admin
                        .save()
                        .then((result) => {
                            res.json({
                                status: "success",
                                msg: "Successfully updated the student cap",
                            });
                        })
                        .catch((err) => {
                            res.json({
                                status: "fail",
                                result: "save error",
                            });
                        });
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.post("/set_studentsPerFacuty/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const cap = req.body.cap;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            if (faculty) {
                Admin.findOne({ admin_id: faculty._id })
                    .then((admin) => {
                        admin.studentsPerFaculty = cap;

                        admin
                            .save()
                            .then((result) => {
                                res.json({
                                    status: "success",
                                    msg: "Successfully set the number of students per faculty!!",
                                });
                            })
                            .catch((err) => {
                                res.json({
                                    status: "fail",
                                    result: "save error",
                                });
                            });
                    })
                    .catch((err) => {
                        res.json({
                            status: "fail",
                            result: "Admin error",
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: "Faculty not found",
                });
            }
        })
        .catch((err) => {
            res.json({
                status: "fail",
                result: "Authentication error",
            });
        });
});

module.exports = router;