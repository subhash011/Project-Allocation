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
  const promises = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      // console.log(faculty);
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

  Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(faculty => {
    Admin.findOne({ admin_id: faculty._id })
      .then(admin => {
        console.log(admin);

        if (admin) {
          var startDate;
          // console.log(admin.deadlines.length);
          if (admin.deadlines.length) {
            startDate = admin.startDate;
          }

          res.json({
            status: "success",
            stage: admin.stage,
            deadlines: admin.deadlines,
            startDate: startDate
          });
        } else {
          res.json({
            status: "fail",
            stage: 0,
            deadlines: "",
            startDate: startDate
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

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      Admin.findOne({ admin_id: faculty._id })
        .then(admin => {
          admin.stage = stage;

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

router.post("/setDeadline/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const date = req.body.deadline;

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      Admin.findOne({ admin_id: faculty._id })
        .then(admin => {
          // console.log(admin)

          // console.log(admin.startDate)
          if (admin.stage == 0) {
            admin.startDate = date;
          }

          if (admin.stage - 1 == admin.deadlines.length || admin.stage == 0)
            admin.deadlines.push(date);

          admin
            .save()
            .then(result => {
              res.json({
                status: "success",
                msg: "Successfully set the deadline"
              });
            })
            .catch(err => {
              res.json({
                status: "fail",
                result: null
              });
            });
        })
        .catch(err => {
          res.json({
            status: "fail",
            result: null
          });
        });
    })
    .catch(err => {
      res.json({
        status: "fail",
        result: null
      });
    });
});

router.get("/stream_email/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const emails = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then(faculty => {
      const stream = faculty.stream;

      Faculty.find({ stream: stream })
        .then(faculty => {
          for (const fac of faculty) {
            emails.push(fac.email);
          }

          res.json({
            status: "success",
            result: emails,
            stream: stream
          });
        })
        .catch(err => {
          res.json({
            status: "fail",
            result: null
          });
        });
    })
    .catch(err => {
      res.json({
        status: "fail",
        result: null
      });
    });
});

module.exports = router;
