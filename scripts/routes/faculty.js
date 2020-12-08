const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");


router.post("/done", (req, res) => {
    mongoose.connection.db.dropDatabase().then(() => {
        res.send("success");
    });
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;
    Faculty.findById(id).then((faculty) => {
        const projectList = faculty.project_list;
        Project.find({_id: {$in: projectList}})
            .then(() => {
                const updateResult = [
                    {
                        $project: {
                            _id: 1,
                            projects_preference: {
                                $setDifference: [["$project_alloted"], projectList],
                            },
                            name: 1,
                            gpa: 1,
                            __v: 1,
                            project_alloted: {
                                $cond: [
                                    {$in: ["$project_alloted", projectList]},
                                    undefined,
                                    "$project_alloted",
                                ],
                            },
                        },
                    },
                ];
                Student.updateMany({}, updateResult)
                    .then((students) => {
                        res.json({
                            message: "success",
                            result: students,
                        });
                    })
                    .catch((err) => {
                        res.send(err);
                    });
            })
            .catch((err) => {
                res.send(err);
            });
    });
});

router.post("/add/:num", (req, res) => {
    const num = req.params.num;
    const promises = [];

    for (let index = 0; index < num; index++) {
        let names = "f" + (index + 1);

        const faculty = new Faculty({
            name: names,
            email: names + "@abc.com",
            stream: "CSE",
            programs: [
                {
                    full: "UGCSE",
                    short: "UGCSE",
                },
            ],
        });

        promises.push(
            faculty.save().then((result) => {
                return result;
            })
        );
    }

    Promise.all(promises).then((result) => {
        res.json(result);
    });
});

module.exports = router;
