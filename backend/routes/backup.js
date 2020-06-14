const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
const Streams = require("../models/Streams");


router.get(`/${process.env.SECRET_KEY}/streams`,(req,res) => {
    Streams.find().then(streams => {
        res.send(streams);
    })
});

router.get(`/${process.env.SECRET_KEY}/projects`,(req,res) => {
    Project.find().then(streams => {
        res.send(streams);
    })
});

router.get(`/${process.env.SECRET_KEY}/students`,(req,res) => {
    Student.find().then(streams => {
        res.send(streams);
    })
})

router.get(`/${process.env.SECRET_KEY}/faculty`,(req,res) => {
    Faculty.find().then(streams => {
        res.send(streams);
    })
})

router.get(`/${process.env.SECRET_KEY}/super`,(req,res) => {
    SuperAdmin.find().then(streams => {
        res.send(streams);
    })
})

router.get(`/${process.env.SECRET_KEY}/admin`,(req,res) => {
    Admin.find().then(streams => {
        res.send(streams);
    })
})

router.get(`/${process.env.SECRET_KEY}/mappings`,(req,res) => {
    Mapping.find().then(streams => {
        res.send(streams);
    })
})

module.exports = router;