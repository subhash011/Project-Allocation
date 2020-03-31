const express = require("express");
const router = express.Router();
const Project = require("../models/Project")
router.get("/", (req, res) => {
    var str = req.body["search"];
    if (str == "" || str == null) {
        Project.find().then(projects => {
            res.json(projects);
        })
    } else {
        Project.find({ title: { $regex: str, $options: 'i' } }).then(projects => {
            res.json(projects)
        }).catch(err => {
            res.send(err);
        })
    }
});

module.exports = router;