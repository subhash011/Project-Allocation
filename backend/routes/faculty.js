const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const Mapping = require("../models/Mapping");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then((user_partial) => {
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

router.get("/details/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
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

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            if (faculty) {
                const streamMap = new Map(programs);

                const ex_programs = faculty.programs;

                if (ex_programs.length == 0 || ex_programs == null) {
                    var new_programs = programs;
                } else {
                    for (const program of ex_programs) {
                        if (streamMap.has(program.short)) {
                            streamMap.delete(program.short);
                        }
                    }
                }

                streamMap.forEach(function(value, key) {
                    const obj = {
                        full: value,
                        short: key,
                    };
                    faculty.programs.push(obj);
                });

                faculty
                    .save()
                    .then((result) => {
                        res.json({
                            status: "success",
                            msg: "Successfully added the programs",
                        });
                    })
                    .catch((err) => {
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
        .catch((err) => {
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

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            if (faculty) {
                faculty.name = name;

                faculty
                    .save()
                    .then((result) => {
                        res.json({
                            status: "success",
                            msg: "Successfully updated the profile!!",
                        });
                    })
                    .catch((err) => {
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
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/getAllPrograms/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .lean()
        .select("_id")
        .then((faculty) => {
            if (faculty) {
                Mapping.find()
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
                    .catch((err) => {
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
        .catch((err) => {
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
        $pull : {programs : curr_program}
    }


    Faculty.findOneAndUpdate({ google_id: { id: id, idToken: idToken } },updateConfig)
        .then((faculty) => {
            if (faculty) {
               
                Project.find({faculty_id : faculty._id, stream : curr_program.short})
                    .then(projects =>{

                        const project_ids = projects.map(project => project._id);
                        
                        Project.deleteMany({faculty_id : faculty._id, stream : curr_program.short})
                            .then(result=>{
                                
                                updateConfig = {
                                    $pullAll : {projects_preference: project_ids}
                                }
                                Student.updateMany({stream:curr_program.short},updateConfig)
                                    .then(result=>{
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
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

router.get("/getFacultyPrograms/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
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
        .catch((err) => {
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
    var facultyDetails = {};
    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .lean()
        .select("_id")
        .then((faculty) => {
            Admin.findOne({ stream: program.short })
                .lean()
                .then((admin) => {
                    if (admin) {
                        var stage = admin.stage;
                        if (admin.deadlines.length)
                            var deadline = admin.deadlines[admin.deadlines.length - 1];
                        else var deadline = null;

                        Project.find({ faculty_id: faculty._id, stream: program.short })
                            .populate({path:"student_alloted", select:"-google_id -date", model:Student})
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
                            .catch((err) => {
                                res.json({
                                    status: "fail-student",
                                    result: null,
                                });
                            });
                    } else {
                        if (faculty) {
                            Project.find({ faculty_id: faculty._id, stream: program.short })
                                .populate({path:"student_alloted", select:"-google_id -date", model:Student})
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
                .catch((err) => {
                    res.json({
                        status: "Admin find error",
                        result: null,
                    });
                });
        })
        .catch((err) => {
            res.json({
                status: "Faculty not found",
                result: null,
            });
        });
});

router.post("/getAdminInfo_program/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const program = req.body.program;

    Admin.findOne({ stream: program })
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
        .catch((err) => {
            res.json({
                status: "fail",
                result: null,
            });
        });
});

module.exports = router;