const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
oauth = require("../config/oauth");

router.post("/user_check", (req, res) => {
  const userDetails = req.body;

  //   console.log(userDetails);
  oauth(userDetails.idToken)
    .then(user => {
      console.log(user);
      const email = userDetails.email.split("@");
      const email_check = email[1];

      if (email_check === "smail.iitpkd.ac.in") {
        const rollno = email[0];

        Student.findOne({ google_id: { id: userDetails.id } })
          .then(user => {
            if (user) {
              user.google_id.idToken = userDetails.idToken;

              user
                .save()
                .then(result => {
                  res.json({
                    isRegistered: true,
                    position: "student",
                    user_details: userDetails
                  });
                })
                .catch(err => {
                  console.log(err);
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
        Faculty.findOne({ google_id: { id: userDetails.id } })
          .then(user => {
            if (user) {
              user.google_id.idToken = userDetails.idToken;

              user
                .save()
                .then(result => {
                  res.json({
                    isRegistered: true,
                    position: "faculty",
                    user_details: userDetails
                  });
                })
                .catch(err => {
                  console.log(err);
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
    })
    .catch(err => {
      console.log(err);
      res.json({
        isRegistered: false,
        position: "login-error",
        user_details: userDetails
      });
    });
});

module.exports = router;
