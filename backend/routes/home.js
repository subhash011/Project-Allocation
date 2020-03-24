const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const bodyparser = require("body-parser");

router.get("/", (req, res) => {
  var str = req.flash("login_error");
  res.json({ message: str[0] });
});

module.exports = router;


