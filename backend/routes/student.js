const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Student = require("../models/Student");
const oauth = require("../config/oauth");

// app.get("/", (req, res) => {
//     res.json(req.params);
// });
// app.get("/register", (req, res) => {
//     res.json({ message: "register yourself" });
// });
// app.post("/", (req, res) => {
//     res.json(req.body);
// });
// app.post("/register", (req, res) => {
//     var new_student = {
//         name: req.body.name,
//         roll_no: req.body.roll_no,
//         email: req.body.email,
//         gpa: req.body.gpa,
//         stream: req.body.stream,
//         date: Date.now()
//     };
//     var student = new Student(new_student);
//     student
//         .save()
//         .then(() => {
//             res.json({ message: "success" });
//         })
//         .catch(err => {
//             if (err) {
//                 res.json({ message: "fail" });
//             }
//         });
// });

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const user = req.body;
    oauth(idToken).then(user_partial => {
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
    });
});

router.get("/details/:id", (req, res) => {
    const id_user = req.params.id;
    const idToken_user = req.headers.authorization;
    Student.findOne({ google_id: { id: id_user, idToken: idToken_user } })
        .then(user => {
            console.log(user);
            if (user) {
                res.json({
                    status: "success",
                    user_details: user
                });
            } else {
                res.json({
                    status: "fail",
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
});

module.exports = router;