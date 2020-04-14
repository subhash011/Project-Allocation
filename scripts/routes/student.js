const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");

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
        res.send(result);
    });
});

router.post("/add/projects", (req, res) => {});

module.exports = router;