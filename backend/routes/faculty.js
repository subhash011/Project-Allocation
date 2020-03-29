const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");

router.post("/register/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  const user = req.body;
  oauth(idToken).then(user_partial => {
    const newUser = new Faculty({
      name: user.name,
      google_id: {
        id: id,
        idToken: idToken
      },
      email: user.email,
      stream: user.stream
    });
    //Saves user in the database
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
  const id = req.params.id;
  const idToken = req.headers.authorization;
  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(user => {
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
