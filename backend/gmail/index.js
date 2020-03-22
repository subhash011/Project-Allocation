const express = require("express");
app = express.Router();
passport = require("passport");
auth = require("./auth");
auth(passport);
app.use(passport.initialize());
// app.get("/", (req, res) => {
//     res.json({
//         status: "session cookie not set"
//     });
// });

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
            res.redirect("/auth/google"); // redirect them back to the login page
        } else {
            res.redirect("/auth/google");
            // res.json({ message: "Use the Institute mail ID" }); //invalid mail id
        }
    },
    (req, res) => {
        // On success, redirect back to '/'
        res.redirect("/");
    }
);
app.get("/", (req, res) => {
    res.send("authenticated successfully");
});
module.exports = app;