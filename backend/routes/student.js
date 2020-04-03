const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const oauth = require("../config/oauth");

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then(() => {
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
        newUser
            .save()
            .then(result => {
                res.json({
                    registration: "success"
                });
            })
            .catch(err => {
                res.json({
                    registration: "fail"
                });
            });
    }).catch(() => {
        res.json({
            message: "invalid-client",
            result: null
        })
    });
});

router.get("/details/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    oauth(idToken).then(user => {
        Student.findOne({ google_id: { id: id, idToken: idToken } })
            .then(user => {
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
            })
            .catch(err => {
                res.json({
                    status: "fail",
                    user_details: err
                });
            });
    }).catch(() => {
        res.json({
            message: "invalid-client",
            result: null
        })
    })
});

module.exports = router;