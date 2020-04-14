const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

router.post("/:faculty/:num", (req, res) => {
    const faculty_name = req.params.faculty;
    const num = req.params.num;

    Faculty.findOne({ name: faculty_name }).then((faculty) => {
        if (faculty) {
            var promises = [];

            for (let index = 0; index < num; index++) {
                let names = faculty_name + "_p" + (index + 1);
                let studentIntake = (Math.random() * 5 + 1).toFixed();

                const project = new Project({
                    title: names,
                    studentIntake: studentIntake,
                    faculty_id: faculty._id,
                });

                faculty.project_list.push(project._id);

                promises.push(
                    project.save().then((result) => {
                        return result;
                    })
                );
            }

            Promise.all(promises).then((result) => {
                faculty.save().then((ans) => {
                    res.json(result);
                });
            });
        }
    });
});

router.post("/add", (req, res) => {
    var promises = [];

    Faculty.find({})
        .then((faculties) => {
            for (const faculty of faculties) {
                const num = (Math.random() * 5 + 1).toFixed();

                for (let index = 0; index < num; index++) {
                    let names = faculty.name + "_p" + (index + 1);
                    let studentIntake = (Math.random() * 5 + 1).toFixed();

                    const project = new Project({
                        title: names,
                        studentIntake: studentIntake,
                        faculty_id: faculty._id,
                    });

                    faculty.project_list.push(project._id);

                    promises.push(
                        project
                        .save()
                        .then((result) => {
                            return result;
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                    );
                }

                promises.push(
                    faculty
                    .save()
                    .then((result) => {
                        return result;
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                );
            }

            Promise.all(promises)
                .then((result) => {
                    res.json(result);
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;