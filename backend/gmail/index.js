const express = require("express");
const app = express.Router();
const axios = require("axios");
passport = require("passport");
auth = require("./auth");
auth(passport);
app.use(passport.initialize());
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
app.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    })
);
app.get(
    "/google/callback",
    passport.authenticate("google"), // complete the authenticate using the google strategy
    (err, req, res, next) => {
        // custom error handler to catch any errors, such as TokenError
        if (err.name === "TokenError") {
            var error_message = {
                error: "Some Error Occured! Try Again.",
                message: "fail"
            };
            res.json(error_message);
        } else {
            // req.flash("login_error", "Use the Institute mail ID");
            // res.redirect("/");
            // res.json({ message: "Use the Institute mail ID" }); //invalid mail id
            var error_message = {
                error: "Invalid Emaid-ID! Use the instituie mail-id.",
                message: "fail"
            };
            res.json(error_message);
        }
    },
    (req, res, next) => {
        // On success, redirect back to '/student' if student
        if (req["user"]["isStudent"]) {
            Student.findOne({ email: req["user"]["mail"] })
                .then(response => {
                    if (response) {
                        axios
                            .get("http://localhost:3000/student", {
                                params: {
                                    message: "student already registered",
                                    id: response._id
                                }
                            })
                            .then(() => {
                                console.log("done");
                            });
                    } else {
                        axios
                            .get("http://localhost:3000/student", {
                                params: {
                                    message: "student not yet registered",
                                    mail: req["user"]["mail"]
                                }
                            })
                            .then(res => {
                                console.log(res);
                            });
                        res.json({ message: "/student" });
                    }
                })
                .catch(err => {
                    if (err) {
                        console.log(err);
                    }
                });
        } else {
            Faculty.findOne({ email: req["user"]["mail"] })
                .then(response => {
                    if (response) {
                        res.redirect("/faculty");
                    } else {
                        res.redirect("/faculty/register");
                    }
                })
                .catch(err => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
    }
);

module.exports = app;