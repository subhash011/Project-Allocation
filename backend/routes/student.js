const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Student = require("../models/Student");
const oauth = require("../config/oauth");

router.post("/register/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  const user = req.body;

  oauth(idToken).then(user_partial => {
    const newUser = new Student({
      name: user.name,
      roll_no: user.roll,
      google_id: {
        id: id,
        idToken: idToken
      },
      email: user.email,
      gpa: user.gpa,
      stream: user.stream
    });

    //Saves user in the database
    // newUser.save()
    //     .then((result)=>{
    //         res.json({
    //             registerd:'success'
    //         })
    //     })
    //     .catch(err=>{
    //         res.json({
    //             registered:'fail'
    //         })
    //     })
  });
});

router.get("/details/:id", (req, res) => {
  const id = req.params;
  //   console.log(id);
  const idToken = req.headers.authorization;

  Student.find({ google_id: { id: id } })
    .then(user => {
      console.log("working");

      if (user.google_id.idToken === idToken) {
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
