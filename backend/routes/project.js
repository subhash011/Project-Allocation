const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Project = require("../models/Project");
const oauth = require("../config/oauth");

router.get("/project/:id", (req, res) => {
    Project.find().then((projects) => {
        if (projects) {
            res.json(projects);
        }
    })
})

module.exports = router;