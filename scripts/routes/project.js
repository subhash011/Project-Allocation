const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

function getRandom(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

router.post("/:faculty/:num", (req, res) => {
    const faculty_name = req.params.faculty;
    const num = req.params.num;

    Faculty.findOne({name: faculty_name}).then((faculty) => {
        if (faculty) {
            const promises = [];

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
                faculty.save().then(() => {
                    res.json(result);
                });
            });
        }
    });
});

router.post("/add", (req, res) => {
    const promises = [];

    Faculty.find({})
        .then((faculties) => {
            for (const faculty of faculties) {
                const num = 20;
                const programs = faculty.programs.map(val => val.short);
                for (let index = 0; index < num; index++) {
                    let names = faculty.name + "_pr" + (index + 1);
                    let studentIntake = getRandomInt(1, 5);
                    let st = getRandom(programs, 1)[0];
                    const project = new Project({
                        title: names,
                        studentIntake: studentIntake,
                        faculty_id: faculty._id,
                        description: names,
                        duration: 1,
                        stream: st,
                        isIncluded: (studentIntake > 2)
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
