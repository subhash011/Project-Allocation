const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const Service = require("../helper/serivces");
var branches = Service.branches;


router.get("/project/:id", (req, res) => {
  console.log('hitting')

  const id = req.params.id;
  const idToken = req.headers.authorization;
  oauth(idToken)
    .then((user) => {
      Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
        (faculty) => {
          if (faculty) {
            Admin.findOne({ admin_id: faculty._id }).then((admin) => {
              if (admin) {
                const stream = admin.stream;
                Project.find({ stream: stream })
                  .populate("faculty_id")
                  .populate("student_alloted")
                  .then((projects) => {
                    var arr = [];
                    for (const project of projects) {
                      const newProj = {
                        title: project.title,
                        description: project.description,
                        stream: project.stream,
                        duration: project.duration,
                        faculty: project.faculty_id.name,
                        numberOfPreferences: project.students_id.length,
                        student_alloted: project.student_alloted,
                      };
                      arr.push(newProj);
                    }
                    res.json({
                      message: "success",
                      result: arr,
                    });
                  })
                  .catch(() => {
                    res.status(500);
                  });
              } else {
                res.json({
                  message: "invalid-token",
                  result: null,
                });
              }
            });
          } else {
            res.json({
              message: "invalid-token",
              result: null,
            });
          }
        }
      );
    })
    .catch(() => {
      res.json({
        message: "invalid-client",
        result: null,
      });
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
            if (admin.deadlines.length) {
              startDate = admin.startDate;
            }

            res.json({
              status: "success",
              stage: admin.stage,
              deadlines: admin.deadlines,
              startDate: startDate,
              projectCap: admin.project_cap,
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

  const format_date = new Date(date);

  format_date.setHours(18);
  format_date.setMinutes(30);

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      Admin.findOne({ admin_id: faculty._id })
        .then((admin) => {
          if (admin.stage == 0) {
            admin.startDate = new Date();
          }

          if (admin.stage == admin.deadlines.length || admin.stage == 0)
            admin.deadlines.push(format_date);

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

router.post("/set_projectCap/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;
  const cap = req.body.cap;
  const promises = [];

  Faculty.findOne({ google_id: { id: id, idToken: idToken } })
    .then((faculty) => {
      Admin.findOne({ admin_id: faculty._id })
        .then((admin) => {
          admin.project_cap = cap;

          const stream = admin.stream;

          Faculty.find({ stream: stream }).then((faculty_members) => {
            for (const fac of faculty_members) {
              fac.project_cap = cap;

              promises.push(
                fac
                  .save()
                  .then((result) => {
                    return result;
                  })
                  .catch((err) => {
                    return err;
                  })
              );
            }

            Promise.all(promises).then((result) => {
              for (const ans of result) {
                if (!ans) {
                  res.json({
                    status: "fail",
                    result: "saving faculty error",
                  });
                }
              }

              admin
                .save()
                .then((result) => {
                  res.json({
                    status: "success",
                    msg: "Successfully updated the project cap",
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "fail",
                    result: "save error",
                  });
                });
            });
          });
        })
        .catch((err) => {
          res.json({
            status: "fail",
            result: "admin error",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "fail",
        result: "faculty error",
      });
    });
});



module.exports = router;
