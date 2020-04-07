const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Mapping = require("../models/Mapping");
router.get("/maps", (req, res) => {
    Mapping.find()
        .then((maps) => {
            if (maps) {
                res.json({
                    message: "success",
                    result: maps,
                });
            } else {
                res.json({
                    message: "success",
                    result: null,
                });
            }
        })
        .catch(() => {
            res.json({
                message: "error",
                result: null,
            });
        });
});

module.exports = router;