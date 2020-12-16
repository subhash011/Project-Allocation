const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

// get all details of the student
router.get("/details/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let populator = {
            path: "project_alloted",
            select: "title faculty_id description studentIntake duration",
            model: Project,
            populate: {
                path: "faculty_id",
                select: "name email",
                model: Faculty
            }
        };
        let user = await Student.findOne({google_id: {id: id, idToken: idToken}}).lean()
                                .select("-google_id -__v -date -projects_preference").populate(populator);
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                student: user
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

// get student's stream stage
router.get("/stage/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let student = await Student.findOne({google_id: {id: id, idToken: idToken}}).lean().select("stream");
        if (student) {
            const stream = student.stream;
            let admin = await Admin.findOne({stream: stream});
            if (!admin || !admin.admin_id) {
                res.status(200).json({
                    statusCode: 200,
                    message: "success",
                    result: {
                        adminPresent: false
                    }
                });
                return;
            }
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    adminPresent: true,
                    stage: admin.stage
                }
            });
        } else {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

module.exports = router;
