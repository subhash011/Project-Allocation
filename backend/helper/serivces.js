const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const Mapping = require("../models/Mapping");

branches = [];

Mapping.find().then((maps) => {
    for (const map of maps) {
        branches.push(map.short);
    }
});

module.exports = {
    branches: branches,
};