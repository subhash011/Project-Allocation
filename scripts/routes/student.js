const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

router.post("/add/:n", (req, res) => {
    const count = req.params.n;
    var gpas = [];
    var names = [];
    var promises = [];
    for (let index = 0; index < count; index++) {
        names.push("s" + (index + 1));
        gpas.push((Math.random() * 5 + 5).toFixed(2));
        const student = new Student({
            name: names[index],
            gpa: gpas[index],
        });
        promises.push(
            student.save().then((result) => {
                return result;
            })
        );
    }
    Promise.all(promises).then((result) => {
        res.json(result);
    });
});

router.post("/projects/add", (req, res) => {
    var promises = [];
    promises.push(
        Student.find().then((students) => {
            return students;
        })
    );
    promises.push(
        Project.find().then((projects) => {
            return projects._id;
        })
    );
    Promise.all(promises).then((result) => {
        promises = [];
        const students = result[0];
        const projects = result[1];

        for (const student of students) {
            const number = Math.floor(Math.random() * 5);
            const arr = getRandom(projects, number);
            student.projects_preference = arr;
            promises.push(
                student.save().then((student) => {
                    return student;
                })
            );
        }
        Promise.all(promises).then((result) => {
            res.send(result);
        });
    });
});

module.exports = router;