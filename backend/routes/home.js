const express = require("express");
const router = express.Router();
const SuperAdmin = require("../models/SuperAdmin");
const Programs = require("../models/Programs");
const Streams = require("../models/Streams");


// get all maps/programs
router.get("/maps", async (req, res) => {
    try {
        let programs = await Programs.find().lean();
        if (programs) {
            res.json({
                message: "success",
                result: programs
            });
        } else {
            res.json({
                message: "success",
                result: []
            });
        }
    } catch (e) {
        res.json({
            message: "error",
            result: null
        });
    }
});

// get all branches/streams
router.get("/branches", async (req, res) => {
    try {
        let streams = await Streams.find().lean();
        if (streams) {
            res.json({
                message: "success",
                result: streams
            });
        } else {
            res.json({
                message: "success",
                result: []
            });
        }
    } catch (e) {
        res.json({
            message: "error",
            result: null
        });
    }
});

// add a branch/stream
router.post("/branches/:id", async (req, res) => {
    try {
        let inStream = req.body;
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (user) {
            const newStream = new Streams({
                short: inStream.short,
                full: inStream.full
            });
            let stream = await newStream.save();
            res.json({
                message: "success",
                result: stream
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-client",
            result: null
        });
    }
});

// add a map/program
router.post("/maps/:id", async (req, res) => {
    try {
        const inProgram = req.body;
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (user) {
            const newProgram = new Programs({
                short: inProgram.short,
                full: inProgram.full
            });
            let program = await newProgram.save();
            res.json({
                message: "success",
                result: program
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-client",
            result: null
        });
    }
});

// remove a branch/stream
router.delete("/branches/remove/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const short = req.headers.body;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (user) {
            let stream = await Streams.findOneAndDelete({short: short});
            res.json({
                message: "success",
                result: stream
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

// remove a map/program
router.delete("/maps/remove/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const short = req.headers.body;
        let user = await SuperAdmin.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (user) {
            let program = await Programs.findOneAndDelete({short: short});
            res.json({
                message: "success",
                result: program
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

module.exports = router;
