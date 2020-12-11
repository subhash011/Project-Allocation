const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const oauth = require("../config/oauth");

// TODO check if this is used anywhere
// register the student
router.post("/register/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const user = req.body;
        await oauth(idToken);
        const newUser = new Student({
            name: user.name,
            roll_no: user.roll_no,
            google_id: {
                id: id,
                idToken: idToken
            },
            email: user.email,
            gpa: user.gpa,
            stream: user.stream
        });
        try {
            await newUser.save();
            res.json({
                registration: "success"
            });
        } catch (e) {
            res.json({
                registration: "fail"
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-client",
            result: null
        });
    }
});

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
        if (user) {
            res.json({
                status: "success",
                user_details: user
            });
        } else {
            res.json({
                status: "invalid-token",
                user_details: ""
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            user_details: err
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
            if (admin) {
                res.json({
                    message: "success",
                    result: admin.stage
                });
            } else {
                res.json({
                    message: "error",
                    result: "no-admin"
                });
            }
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

// TODO check if this route is used
// update student profile
router.post("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const document = req.body;
        const updateResult = {
            name: document.name,
            gpa: document.gpa
        };
        let student = await Student.findOneAndUpdate({google_id: {id: id, idToken: idToken}}, updateResult);
        if (student) {
            res.json({
                message: "success",
                result: student
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

module.exports = router;
