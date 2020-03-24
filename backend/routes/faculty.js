const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Faculty = require("../models/Faculty");

app.get("/", (req, res) => {
    res.send(req.body);
});

app.post("/register", (req, res) => {
    var new_faculty = {
        name: req.body.name,
        email: req.body.email,
        isAdmin: false,
        stream: req.body.stream,
        date: Date.now()
    };

    var faculty = new Faculty(new_faculty);
    faculty
        .save()
        .then(() => {
            res.json({ message: "faculty added successfully" });
        })
        .catch(err => {
            if (err) {
                throw err;
            }
        });
});

module.exports = app;