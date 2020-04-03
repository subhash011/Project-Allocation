const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Student = require("../models/Student");
const oauth = require("../config/oauth");

//fetch project details of the student's stream
router.get("/:id", (req, res) => {
    var student_projects = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then(user => {
            var promise = Student.findOne({ google_id: { id: id, idToken: idToken } })
                .then(student => {
                    if (student) {
                        return student["stream"];
                    } else {
                        res.json({
                            message: "token-expired"
                        });
                        return null;
                    }
                })
                .then(stream => {
                    if (stream) {
                        Project.find({ stream: stream })
                            .populate("faculty_id")
                            .then(projects => {
                                for (const project of projects) {
                                    var details = {
                                        _id: project["_id"],
                                        title: project["title"],
                                        description: project["description"],
                                        duration: project["duration"],
                                        studentIntake: project["studentIntake"],
                                        faculty_name: project["faculty_id"]["name"],
                                        faculty_email: project["faculty_id"]["email"]
                                    };
                                    student_projects.push(details);
                                }
                                res.json(student_projects);
                            });
                    }
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null
            });
        });
});

//fetch student preferences
router.get("/preference/:id", (req, res) => {
    var promises = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then(user => {
            var promise = Student.findOne({ google_id: { id: id, idToken: idToken } })
                .then(student => {
                    if (student) {
                        return student["projects_preference"];
                    } else {
                        res.json({ message: "invalid-token" });
                        return null;
                    }
                })
                .catch(err => {
                    res.json(err);
                })
                .then(project_id => {
                    if (project_id) {
                        for (const project of project_id) {
                            promises.push(
                                Project.findById(project)
                                .populate("faculty_id")
                                .then(project => {
                                    var new_details = {
                                        _id: project["_id"],
                                        title: project["title"],
                                        description: project["description"],
                                        duration: project["duration"],
                                        studentIntake: project["studentIntake"],
                                        faculty_name: project["faculty_id"]["name"],
                                        faculty_email: project["faculty_id"]["email"]
                                    };
                                    return new_details;
                                })
                                .catch(err => {
                                    res.json(err);
                                })
                            );
                        }
                        Promise.all(promises).then(result => {
                            res.json(result);
                        });
                    }
                });
        })
        .catch(err => {
            res.json({
                message: "invalid-client",
                result: null
            });
        });
});
//store student preferences
router.post("/preference/:id", (req, res) => {
    const id = req.params.id;
    const projects = req.body;
    const project_idArr = projects.map(val =>
        mongoose.Types.ObjectId(val["_id"])
    );
    var studentStream;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then(user => {
            var promise = Student.findOneAndUpdate({ google_id: { id: id, idToken: idToken } }, { projects_preference: project_idArr })
                .then(student => {
                    if (student) {
                        studentStream = student.stream;
                        return student._id;
                    } else {
                        return null;
                    }
                })
                .then(student => {
                    if (student) {
                        Project.find({ stream: studentStream }).then(projects => {
                            for (const project of projects) {
                                var projIsInArr = project_idArr.some(function(val) {
                                    return val.equals(project._id);
                                });
                                var stdIsInProj = project.students_id.some(function(val) {
                                    return val.equals(student);
                                });
                                if (projIsInArr && !stdIsInProj) {
                                    project.students_id.push(student);
                                } else if (!projIsInArr && stdIsInProj) {
                                    project.students_id = project.students_id.filter(
                                        val => !val.equals(student)
                                    );
                                }
                                project
                                    .save()
                                    .then(proj => {
                                        res.json({ message: "success" });
                                    })
                                    .catch(err => {
                                        res.status(500);
                                    });
                            }
                        });
                    } else {
                        res.json({ message: "invalid-token" });
                    }
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null
            });
        });
});

module.exports = router;