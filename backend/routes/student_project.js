const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Project = require("../models/Project");
const Student = require("../models/Student");
const oauth = require("../config/oauth");

//fetch project details of the student's stream
router.get("/:id", (req, res) => {
    var stream = "";
    var student_projects = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    var promise = Student.findOne({ google_id: { id: id, idToken: idToken } })
        .then(student => {
            if (student) {
                return student["stream"];
            }
        })
        .then(stream => {
            Project.find({ stream: stream })
                .then(projects => {
                    for (const project of projects) {
                        var details = {
                            title: project["title"],
                            description: project["description"],
                            duration: project["duration"],
                            studentIntake: project["studentIntake"],
                            faculty_id: project["faculty_id"]
                        };
                        student_projects.push(details);
                    }
                    res.json(student_projects);
                })
                .catch(err => {
                    res.json(err);
                });
        })
        .catch(err => {
            res.json(err);
        });
});

//fetch student preferences
router.get("/preference/:id", (req, res) => {
    var project_id = [];
    var projects = [];
    var promises = [];
    const id = req.params.id;
    const idToken = req.headers.authorization;
    var promise = Student.findOne({ google_id: { id: id, idToken: idToken } })
        .then(student => {
            if (student) {
                return student["projects_preference"];
            } else {
                res.json({ message: "Student not Registered" });
            }
        })
        .catch(err => {
            res.json(err);
        })
        .then(project_id => {
            for (const project of project_id) {
                promises.push(
                    Project.findById(project)
                    .then(details => {
                        return details;
                    })
                    .catch(err => {
                        res.json(err);
                    })
                );
            }
            Promise.all(promises).then(result => {
                res.json(result);
            });
        });
});
//store student preferences
router.post("/preference/:id", (req, res) => {
    const id = req.params.id;
    const projects = req.body;
    var project_id = [];
    const idToken = req.headers.authorization;
    var promise = Student.findOne({ google_id: { id: id, idToken: idToken } })
        .then(student => {
            if (student) {
                for (const project of projects) {
                    project_id.push(mongoose.Types.ObjectId(project["_id"]));
                }
                return project_id;
            } else {
                res.json({ message: "Student not Registered" });
            }
        })
        .then(project_id => {
            Student.findOneAndUpdate({ google_id: { id: id, idToken: idToken } }, { projects_preference: project_id }).then(user => {
                res.json(user["projects_preference"]);
            });
        });
});

module.exports = router;