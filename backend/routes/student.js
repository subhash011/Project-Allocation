const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Student = require("../models/Student");

app.get("/", (req, res) => {
    res.json(req.params);
});
app.get("/register", (req, res) => {
    res.json({ message: "register yourself" });
});
app.post("/", (req, res) => {
    res.json(req.body);
});
app.post("/register", (req, res) => {
    var new_student = {
        name: req.body.name,
        roll_no: req.body.roll_no,
        email: req.body.email,
        gpa: req.body.gpa,
        stream: req.body.stream,
        date: Date.now()
    };
    var student = new Student(new_student);
    student
        .save()
        .then(() => {
            res.json({ message: "success" });
        })
        .catch(err => {
            if (err) {
                res.json({ message: "fail" });
            }
        });
});

module.exports = app;