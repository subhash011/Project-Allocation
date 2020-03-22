const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Student = require("../models/Student");

app.post("/", (req, res) => {
    var new_student = {
        name: req.body.name,
        roll_no: req.body.roll_no,
        email: req.body.email,
        gpa: req.body.gpa,
        stream: req.body.stream,
        date: Date.now()
    };
    var student = new Student(student);
    student
        .save()
        .then(() => {
            console.log("student created");
            res.json({ message: "student added successfully" });
        })
        .catch(err => {
            if (err) {
                console.log(err);
            }
        });
});

module.exports = app;