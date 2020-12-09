const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const Programs = require("../models/Programs");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then(() => {
        const newUser = new Faculty({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken,
            },
            email: user.email,
            stream: user.stream,
            isAdmin: false,
        });
        //Saves user in the database
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

router.get("/details/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("-google_id -date")
        .then((user) => {
            if (user) {
                res.json({
                    status: "success",
                    user_details: user,
                });
            } else {
                res.json({
                    status: "fail",
                    user_details: "",
                });
            }
        })
        .catch((err) => {
            res.json({
                status: "fail",
                user_details: err,
            });
        });
});

router.post("/set_programs/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const programs = req.body.programs;

    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .then((faculty) => {
            if (faculty) {
                const streamMap = new Map(programs);

                const ex_programs = faculty.programs;

                if (ex_programs.length === 0 || ex_programs == null) {
                } else {
                    for (const program of ex_programs) {
                        if (streamMap.has(program.short)) {
                            streamMap.delete(program.short);
                        }
                    }
                }

                streamMap.forEach(function (value, key) {
                    const obj = {
                        full: value,
                        short: key,
                    };
                    faculty.programs.push(obj);
                });

                faculty
                    .save()
                    .then(() => {
                        res.json({
                            status: "success",
                            msg: "Successfully added the programs",
                        });
                    })
                    .catch(() => {
                        res.json({
                            status: "fail",
                            result: null,
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.post("/updateProfile/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const name = req.body.name;

    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .then((faculty) => {
            if (faculty) {
                faculty.name = name;

                faculty
                    .save()
                    .then(() => {
                        res.json({
                            status: "success",
                            msg: "Successfully updated the profile!!",
                        });
                    })
                    .catch(() => {
                        res.json({
                            status: "fail",
                            result: null,
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/getAllPrograms/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("_id")
        .then((faculty) => {
            if (faculty) {
                Programs.find()
                    .lean()
                    .then((result) => {
                        if (result) {
                            res.json({
                                status: "success",
                                programs: result,
                            });
                        } else {
                            res.json({
                                status: "fail",
                                result: null,
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            status: "fail",
                            result: null,
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.post("/deleteProgram/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curr_program = req.body.program;

    var updateConfig = {
        $pull: {programs: curr_program}
    }


    Faculty.findOneAndUpdate({google_id: {id: id, idToken: idToken}}, updateConfig)
        .then((faculty) => {
            if (faculty) {

                Project.find({faculty_id: faculty._id, stream: curr_program.short})
                    .then(projects => {

                        const project_ids = projects.map(project => project._id);

                        Project.deleteMany({faculty_id: faculty._id, stream: curr_program.short})
                            .then(() => {

                                updateConfig = {
                                    $pullAll: {projects_preference: project_ids}
                                }
                                Student.updateMany({stream: curr_program.short}, updateConfig)
                                    .then(() => {
                                        res.json({
                                            status: "success",
                                            msg: "Successfully removed the program.",
                                        });
                                    })
                            })

                    })
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/getFacultyPrograms/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("programs")
        .then((faculty) => {
            if (faculty) {
                const programs = faculty.programs;
                res.json({
                    status: "success",
                    programs: programs,
                });
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.post("/getFacultyProgramDetails/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const program = req.body.program;
    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("_id")
        .then((faculty) => {
            Admin.findOne({stream: program.short})
                .lean()
                .then((admin) => {
                    let deadline;
                    if (admin) {
                        if (admin.deadlines.length) {
                            deadline = admin.deadlines[admin.deadlines.length - 1];
                        } else {
                            deadline = null;
                        }

                        Project.find({faculty_id: faculty._id, stream: program.short})
                            .populate({path: "student_alloted", select: "-google_id -date", model: Student})
                            .then((result) => {
                                const obj = {
                                    program: program,
                                    admin: admin,
                                    curDeadline: deadline,
                                    projects: result,
                                };

                                res.json({
                                    status: "success",
                                    program_details: obj,
                                });
                            })
                            .catch(() => {
                                res.json({
                                    status: "fail-student",
                                    result: null,
                                });
                            });
                    } else {
                        if (faculty) {
                            Project.find({faculty_id: faculty._id, stream: program.short})
                                .populate({path: "student_alloted", select: "-google_id -date", model: Student})
                                .then((projects) => {
                                    const obj = {
                                        program: program,
                                        projects: projects,
                                    };
                                    res.json({
                                        status: "success",
                                        program_details: obj,
                                    });
                                });
                        } else {
                            res.json({
                                status: "fail",
                                result: null,
                            });
                        }
                    }
                })
                .catch(() => {
                    res.json({
                        status: "Admin find error",
                        result: null,
                    });
                });
        })
        .catch(() => {
            res.json({
                status: "Faculty not found",
                result: null,
            });
        });
});

router.post("/getAdminInfo_program/:id", (req, res) => {
    const program = req.body.program;

    Admin.findOne({stream: program})
        .lean()
        .then((admin) => {
            if (admin) {
                res.json({
                    status: "success",
                    admin: admin,
                });
            } else {
                res.json({
                    status: "fail",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/home/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({google_id: {id: id, idToken: idToken}})
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
        })
        .then(faculty => {
            if (!faculty) {
                return null;
            }
            const facultyPrograms = faculty.programs.map(val => val.short);
            let facultyProjects = faculty.project_list;
            facultyProjects = facultyProjects.map(val => {
                return {
                    title: val.title,
                    studentIntake: val.studentIntake,
                    noOfPreferences: val.students_id.length,
                    student_alloted: val.student_alloted,
                    stream: val.stream,
                };
            })
            facultyProjects.sort((a, b) => {
                return a.stream.localeCompare(b.stream)
            });
            return {
                facultyPrograms: facultyPrograms,
                facultyProjects: facultyProjects
            }
        }).then(facultyData => {
        if (!facultyData) {
            res.json({
                message: "invalid-token"
            })
            return;
        }
        let facultyProjects = facultyData.facultyProjects;
        let facultyPrograms = facultyData.facultyPrograms;
        Admin.find({stream: {$in: facultyPrograms}})
            .lean()
            .select("deadlines stream stage")
            .then(admins => {
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
            })
    }).catch(() => {
        res.json({
            message: "error"
        })
    })
})

module.exports = router;     
