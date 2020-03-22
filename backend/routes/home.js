const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
app.get("/", (req, res) => {
    res.json({ message: "home page" });
});
module.exports = app;