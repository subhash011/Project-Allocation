const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

router.get("/:id", (req, res) => {
  const id = String(req.params.id);
  const idToken = req.headers.authorization;
  console.log(id);
  const response_obj = [];
  const promises = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      const stream = faculty.stream;

      Faculty.find({ stream: stream }).then(faculty => {
        // console.log(faculty);

        // for (let element in faculty)
        faculty.forEach(element=>{
          // console.log(element)
          promises.push(
            Project.find({
              _id: { $in: element.project_list }
            })
              .then(result => {
                const obj = {
                  faculty_name: element.name,
                  projects: result
                };
                return obj;
              })
              .catch(err => {
                console.log(err);
              })
          );
        }) 
       
        Promise.all(promises).then(result => {
          res.json({
            project_details : result
          })

        })
        .catch(err=>console.log(err))

      })
      .catch(err=>{
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
