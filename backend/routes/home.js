const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
app.get("/", (req, res) => {
    var str = req.flash("login_error");
    res.json({ message: str[0] });
});
module.exports = app;