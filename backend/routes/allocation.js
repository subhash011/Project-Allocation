const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

cron.schedule("*/2 * * * *", function() {
    console.log("here");
});

module.exports = router;