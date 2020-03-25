const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
oauth = require("../config/oauth");

router.post("/user_check", (req, res) => {
  const userDetails = req.body;

  oauth(userDetails.idToken)
    .then(user => {
      // console.log(user);
      const email = userDetails.email.split("@");
      const email_check = email[1];

      if (email_check === "smail.iitpkd.ac.in") {
        const rollno = email[0];
        Student.findOne({ email: userDetails.email })
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
                  console.log('saved idtoken')
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
        Faculty.findOne({ email: userDetails.email })
          .then(user => {
            if (user) {
              user.google_id.idToken = userDetails.idToken;
              //added a block here for frontend rendering
              if (user.isAdmin) {
                position = "admin";
              } else {
                postition = "faculty";
              }
              user
                .save()
                .then(result => {
                  res.json({
                    isRegistered: true,
                    position: position,
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

router.get("/details/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  oauth(idToken)
    .then(user => {
      const User = {
        name: user.name,
        email: user.email
      };

      const email = user.email.split("@");
      if (email[1] === "smail.iitpkd.ac.in") {
        res.json({
          position: "student",
          user_details: User
        });
      } else if (email[1] === "iitpkd.ac.in") {
        res.json({
          position: "faculty",
          user_details: User
        });
      }
    })
    .catch(err => {
      res.json({
        position: "error",
        user_details: err
      });
    });
});

module.exports = router;
