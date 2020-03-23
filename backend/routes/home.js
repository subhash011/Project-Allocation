const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
app.get("/", (req, res) => {
    var str = req.flash("login_error");
    res.json({ message: str[0] });
});
app.get("/login", (req, res) => {
    res.redirect("http://localhost:3000/auth/google");
});
app.get("/register", (req, res) => {
    res.redirect("http://localhost:3000/auth/google");
});
module.exports = app;