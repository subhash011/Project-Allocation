const express = require("express");
const router = express.Router();
const SuperAdmin = require("../models/SuperAdmin");
const Programs = require("../models/Programs");
const Streams = require("../models/Streams");
const Admin = require("../models/Admin_Info");
const Faculty = require("../models/Faculty");
const Students = require("../models/Student");
const Projects = require("../models/Project");

// get all maps/programs
router.get("/maps", async (req, res) => {
    try {
        let programs = await Programs.find().lean();
        if (!programs) programs = [];
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                programs
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// get all branches/streams
router.get("/branches", async (req, res) => {
    try {
        let streams = await Streams.find().lean();
        if (!streams) streams = [];
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                streams
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        const newStream = new Streams({
            short: inStream.short,
            full: inStream.full
        });
        let stream = await newStream.save();
        res.status(200).json({
            statusCode: 200,
            message: "Successfully added the stream",
            result: {
                updated: true,
                stream
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        const newProgram = new Programs({
            short: inProgram.short,
            full: inProgram.full
        });
        let newAdmin = new Admin({
            stream: inProgram.short
        });
        await newAdmin.save();
        let program = await newProgram.save();
        res.status(200).json({
            statusCode: 200,
            message: "Successfully added the program.",
            result: {
                updated: true,
                program
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let stream = await Streams.findOneAndDelete({short: short});
        res.status(200).json({
            statusCode: 200,
            message: "Successfully removed the stream.",
            result: {
                deleted: true,
                stream
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
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
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        let program;
        let faculty = await Faculty.findOneAndUpdate({adminProgram: short}, {
            isAdmin: false,
            $unset: {adminProgram: ""}
        });
        for (const facProgram of faculty.programs) {
            if (facProgram.short === short) {
                program = facProgram;
            }
        }
        let promises = [
            Programs.findOneAndDelete({short: short}),
            Admin.findOneAndDelete({stream: short}),
            Students.deleteMany({stream: short}),
            Projects.deleteMany({stream: short}),
            Faculty.updateMany({"programs.short": short}, {$pull: {programs: program}})
        ];
        await Promise.all(promises);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully removed the program",
            result: {
                deleted: true,
                program
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

module.exports = router;
