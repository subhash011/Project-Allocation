const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
oauth = require("../config/oauth");

router.get("/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.find({ google_id: { id: id, idToken: idToken } })
        .then(user => {
            user = user[0];
            if (user) {
                Project.find({ faculty_id: user._id })
                    .then(projects => {
                        if (projects) {
                            res.json({
                                status: "success",
                                project_details: projects
                            });
                        } else {
                            res.json({
                                stauts: "fail",
                                project_details: "Error",
                                students: "Error"
                            });
                        }
                    })
                    .catch(err => {
                        res.json({
                            stauts: "fail",
                            project_details: "Project Not Found",
                            students: "Error"
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    project_details: "Not valid faculty id",
                    students: "Error"
                });
            }
        })
        .catch(err => {
            res.json({
                stauts: "fail",
                project_details: "Faculty Not Found",
                students: "Error"
            });
        });
});

router.post("/add/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const project_details = req.body;

    Faculty.find({ google_id: { id: id, idToken: idToken } })
        .then(user => {
            user = user[0];
            if (user) {
                const project = new Project({
                    title: project_details.title,
                    duration: project_details.duration,
                    studentIntake: project_details.studentIntake,
                    description: project_details.description,
                    stream: project_details.stream,
                    faculty_id: user._id
                });

                user.project_list.push(project._id);

                if(user.project_list.length > user.project_cap){
                    res.json({
                        save:'Cap',
                        msg:'You cant add more projects'
                    })
                }


                else{
                    project
                    .save()
                    .then(result => {
                        user.save().then(ans => {
                            res.json({
                                save: "success",
                                msg: "Your project has been successfully added"
                            });
                        });
                    })
                    .catch(err => {
                        res.json({
                            save: "fail",
                            msg: " There was an error, Please try again!" //Display the messages in flash messages
                        });
                    });


                }

             
            } else {
                res.json({
                    save: "fail",
                    msg: "User not found"
                });
            }
        })
        .catch(err => {
            res.json({
                save: "fail",
                msg: "Error in finding user"
            });
        });
});

router.post("/applied/:id", (req, res) => {
    const id = req.params.id;
    const student_ids = req.body.student;
    const idToken = req.headers.authorization;

    oauth(idToken)
        .then(user => {
            if (user["sub"] == String(id)) {
                student_ids.map(id => {
                    mongoose.Types.ObjectId(id);
                });

                Student.find({
                        _id: { $in: student_ids }
                    })
                    .then(students => {
                        res.json({
                            status: "success",
                            students: students
                        });
                    })
                    .catch(err => {
                        res.json({
                            status: "fail",
                            students: "Server Error"
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    students: "Server Error"
                });
            }
        })
        .catch(err => {
            res.json({
                status: "fail",
                students: "Authentication Error"
            });
        });
});

router.post("/save_preference/:id", (req, res) => {
    const id = req.params.id;
    const student = req.body.student;
    const project_id = req.body.project_id;
    const idToken = req.headers.authorization;

    let student_ids = [];

    student.forEach(per => {
        student_ids.push(mongoose.Types.ObjectId(per._id));
    });

    oauth(idToken)
        .then(user => {
            if (user["sub"] == String(id)) {
                Project.findById({ _id: project_id })
                    .then(project => {
                        project.students_id = student_ids;
                        project
                            .save()
                            .then(result => {
                                res.json({
                                    status: "success",
                                    msg: "Your preferences are saved"
                                });
                            })
                            .catch(err => {
                                res.json({
                                    status: "fail",
                                    msg: "Reload and Please try again !"
                                });
                            });
                    })
                    .catch(err => {
                        res.json({
                            status: "fail",
                            msg: "Project Not Found!!! Please Reload"
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    msg: "Invalid Login"
                });
            }
        })
        .catch(err => {
            res.json({
                status: "fail",
                msg: "Authentication Error"
            });
        });
});

router.post("/update/:id", (req, res) => {
    const project_id = mongoose.Types.ObjectId(req.params.id);
    const title = req.body.title;
    const duration = req.body.duration;
    const studentIntake = req.body.studentIntake;
    const description = req.body.description;

    Project.findById({ _id: project_id })
        .then(project => {
            project.title = title;
            project.duration = duration;
            project.studentIntake = studentIntake;
            project.description = description;

            project
                .save()
                .then(result => {
                    res.json({
                        status: "success",
                        msg: "Your Project was successfully updated"
                    });
                })
                .catch(err => {
                    res.json({
                        status: "fail",
                        msg: "Project Not Saved. Please reload and try again!!!"
                    });
                });
        })
        .catch(err => {
            res.json({
                status: "fail",
                msg: "Project Not Found"
            });
        });
});

router.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    Project.findByIdAndRemove({ _id: id })
        .then(result => {
            let students_id = result.students_id;
            let faculty_id = result.faculty_id;

            Faculty.findById({ _id: faculty_id }).then(faculty => {
                let project_list = faculty.project_list;
                let new_list = project_list.filter(project => {
                    if (project.toString() != id) {
                        return project;
                    }
                });
                faculty.project_list = new_list;

                faculty
                    .save()
                    .then(result => {
                        Student.find({
                                _id: { $in: students_id }
                            })
                            .then(students => {
                                students.forEach(student => {
                                    let project_pref = student.projects_preference;
                                    student.projects_preference = project_pref.filter(
                                        project_id => {
                                            if (project_id.toString() != id) {
                                                return project_id;
                                            }
                                        }
                                    );
                                });

                                students.forEach(student => {
                                    student.save();
                                });

                                res.json({
                                    status: "success",
                                    msg: "The project has been successfully deleted"
                                });
                            })
                            .catch(err => {
                                res.json({
                                    status: "fail",
                                    msg: "Unable to update student preferences"
                                });
                            });
                    })
                    .catch(err => {
                        res.json({
                            status: "fail",
                            msg: "Unable to Update the faculty details"
                        });
                    });
            });
        })
        .catch(err =>
            console.log(err => {
                res.json({
                    status: "fail",
                    msg: "Please reload and try again!!!"
                });
            })
        );
});

module.exports = router;