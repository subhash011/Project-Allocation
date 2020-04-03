const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");

router.get("/:id", (req, res) => {
  const id = String(req.params.id);
  const idToken = req.headers.authorization;
  console.log(id);
  const response_obj = [];
  const promises = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      const stream = faculty.stream;

      Faculty.find({ stream: stream })
        .then(faculty => {
          // console.log(faculty);

          // for (let element in faculty)
          faculty.forEach(element => {
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
          });

          Promise.all(promises)
            .then(result => {
              res.json({
                project_details: result
              });
            })
            .catch(err => console.log(err));
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/info/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  Faculty.find({ google_id: { id: id, idToken: idToken } }).then(faculty => {
    Admin.findById({ admin_id: faculty._id })
      .then(admin => {
        if (admin) {
          res.json({
            status: "success",
            stage: admin.stage_no,
            deadlines: admin.deadlines
          });
        } else {
          res.json({
            status: "success",
            stage: 0,
            deadlines: ""
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
});

router.post("/update_stage/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const stage = req.body.stage;

  Faculty.find({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      Admin.findById({ _id: faculty._id })
        .then(admin => {
          admin.stage_no = stage;

          admin
            .save()
            .then(result => {
              res.json({
                status: "success",
                msg: "Successfully moved to the next stage"
              });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});


router.post('/setDeadline/:id',(req,res)=>{


const id = req.params.id;
  const idToken = req.headers.authorization;
  const date = req.body.deadline;

  Faculty.find({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      Admin.findById({ _id: faculty._id })
        .then(admin => {

          if(admin.stage_no - 1 == admin.deadlines.length || admin.stage_no == 0)
            admin.deadlines.push(date);

          admin
            .save()
            .then(result => {
              res.json({
                status: "success",
                msg: "Successfully moved to the next stage"
              });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });

})


module.exports = router;
