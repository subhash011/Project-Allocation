const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const passport = require("passport");

router.post("/user_check", (req, res) => {
  const userDetails = req.body;

  const email = userDetails.email.split("@");
  const email_check = email[1];

  // console.log(req.user)
  if (email_check === "smail.iitpkd.ac.in") {
    const rollno = email[0];
    Student.findOne({ google_id: profile.id })
      .then(user => {
        if (user) {
          res.json({
            isRegistered: true,
            position: "student",
            user_details: userDetails
          });
        } else {
          res.json({
            isRegistered: false,
            position: "student",
            user_details: userDetails
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  } else if (email_check === "iitpkd.ac.in") {
    Faculty.findOne({ google_id: profile.id })
      .then(user => {
        if (user) {
          res.json({
            isRegistered: true,
            position: "faculty",
            user_details: userDetails
          });
        } else {
          res.json({
            isRegistered: false,
            position: "faculty",
            user_details: userDetails
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    res.json({
      isRegistered: false,
      position: "error",
      user_details: userDetails
    });
  }
});

module.exports = router;
