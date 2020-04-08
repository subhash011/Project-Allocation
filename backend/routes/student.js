const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
const oauth = require("../config/oauth");

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken)
        .then(() => {
            const newUser = new Student({
                name: user.name,
                roll_no: user.roll_no,
                google_id: {
                    id: id,
                    idToken: idToken,
                },
                email: user.email,
                gpa: user.gpa,
                stream: user.stream,
            });
            newUser
                .save()
                .then((result) => {
                    res.json({
                        registration: "success",
                    });
                })
                .catch((err) => {
                    res.json({
                        registration: "fail",
                    });
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.get("/details/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken)
        .then((user) => {
            Student.findOne({ google_id: { id: id, idToken: idToken } })
                .then((user) => {
                    if (user) {
                        res.json({
                            status: "success",
                            user_details: user,
                        });
                    } else {
                        res.json({
                            status: "invalid-token",
                            user_details: "",
                        });
                    }
                })
                .catch((err) => {
                    res.json({
                        status: "fail",
                        user_details: err,
                    });
                });
        })
        .catch(() => {
            res.json({
                message: "invalid-client",
                result: null,
            });
        });
});

router.get("/stage/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Student.findOne({ google_id: { id: id, idToken: idToken } }).then(
        (student) => {
            if (student) {
                const stream = student.stream;
                Admin.find({ stream: stream }).then((admin) => {
                    if (admin[0]) {
                        res.json({
                            message: "success",
                            result: admin[0].stage,
                        });
                    } else {
                        res.json({
                            message: "error",
                            result: "no-admin",
                        });
                    }
                });
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        }
    );
});

module.exports = router;