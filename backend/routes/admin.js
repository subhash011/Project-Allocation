const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

var branches = ["CSE", "EE", "ME", "CE"];

router.get("/:id", (req, res) => {
  const id = String(req.params.id);
  const idToken = req.headers.authorization;
  const promises = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      // console.log(faculty);
      const stream = faculty.stream;

      Faculty.find({ stream: stream })
        .then((faculty) => {
          // console.log(faculty);

          // for (let element in faculty)
          faculty.forEach((element) => {
            // console.log(element)
            promises.push(
              Project.find({
                _id: { $in: element.project_list },
              })
                .then((result) => {
                  const obj = {
                    faculty_name: element.name,
                    projects: result,
                  };
                  return obj;
                })
                .catch((err) => {
                  console.log(err);
                })
            );
          });

          Promise.all(promises)
            .then((result) => {
              res.json({
                project_details: result,
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/info/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
    (faculty) => {
      Admin.findOne({ admin_id: faculty._id })
        .then((admin) => {
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
              startDate: startDate,
            });
          } else {
            res.json({
              status: "fail",
              stage: 0,
              deadlines: "",
              startDate: startDate,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  );
});

router.post("/update_stage/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const stage = req.body.stage;

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      Admin.findOne({ admin_id: faculty._id })
        .then((admin) => {
          admin.stage = stage;

          admin
            .save()
            .then((result) => {
              res.json({
                status: "success",
                msg: "Successfully moved to the next stage",
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/setDeadline/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const date = req.body.deadline;

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      Admin.findOne({ admin_id: faculty._id })
        .then((admin) => {
          if (admin.stage == 0) {
            admin.startDate = new Date();
          }

          if (admin.stage == admin.deadlines.length || admin.stage == 0)
            admin.deadlines.push(new Date(date));

          admin
            .save()
            .then((result) => {
              res.json({
                status: "success",
                msg: "Successfully set the deadline",
              });
            })
            .catch((err) => {
              res.json({
                status: "fail",
                result: null,
              });
            });
        })
        .catch((err) => {
          res.json({
            status: "fail",
            result: null,
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "fail",
        result: null,
      });
    });
});

router.get("/stream_email/faculty/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const emails = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      const stream = faculty.stream;

      Faculty.find({ stream: stream })
        .then((faculty) => {
          for (const fac of faculty) {
            emails.push(fac.email);
          }

          res.json({
            status: "success",
            result: emails,
            stream: stream,
          });
        })
        .catch((err) => {
          res.json({
            status: "fail",
            result: null,
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "fail",
        result: null,
      });
    });
});

router.get("/stream_email/student/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const emails = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      const stream = faculty.stream;

      Student.find({ stream: stream })
        .then((students) => {
          for (const student of students) {
            emails.push(student.email);
          }

          res.json({
            status: "success",
            result: emails,
            stream: stream,
          });
        })
        .catch((err) => {
          res.json({
            status: "fail",
            result: null,
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "fail",
        result: null,
      });
    });
});

module.exports = router;
router.get("/all/info", (req, res) => {
  var result = {
    CSE: {},
    EE: {},
    ME: {},
    CE: {},
  };
  var promises = [];
  Admin.find().then((admins) => {
    if (admins.length == branches.length) {
      for (const branch of branches) {
        promises.push(
          Admin.findOne({ stream: branch })
            .populate("admin_id")
            .then((admin) => {
              result[branch] = admin;
              return admin;
            })
        );
      }
      Promise.all(promises).then((prom) => {
        return res.json({
          message: "success",
          result: result,
        });
      });
    } else {
      res.json({
        message: "error",
        result: "atleastOneAdminNeeded",
      });
    }
  });
});


router.get('/removeDeadline/:id',(req,res)=>{


  const id = req.params.id;
  const idToken = req.headers.idToken;

  Faculty.findOne({google_id:{id:id,idToken:idToken}})
    .then(faculty=>{

      Admin.findOne({admin_id:faculty._id})
        .then(admin=>{

          admin.deadlines.pop()
          if(admin.deadlines.length == 0){
            admin.startDate = null;
          }

          admin.save()
            .then(result=>{
              res.json({
                status:"success",
                msg:"Please sign in again"
              })
            })
            .catch(err=>{
              res.json({
                status:"fail",
                msg:null
              })
            })

        })
        .catch(err=>{
          res.json({
            status:"fail",
            msg:null
          })
        })


    })
    .catch(err=>{
      res.json({
        status:"fail",
        msg:null
      })
    })



})


module.exports = router;
