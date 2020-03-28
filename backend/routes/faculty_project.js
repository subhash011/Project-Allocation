const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

router.post("/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  const project_ids = req.body.project_id;
  // const student_ids = req.body.student_id;

  // console.log(project_ids);
  // console.log(student_ids);

  Faculty.find({ google_id: { id: id, idToken: idToken } })
    .then(user => {
      user = user[0];
      // let student_applied = [];
      if (user) {
        Project.find({ faculty_id: user._id })
          .then(projects => {
            // console.log(projects);

            if (projects) {
              // projects.forEach(project => {
              //   project.students_id = project.students_id.map(pr =>
              //     mongoose.Types.ObjectId(pr)
              //   );

              //   Student.find({
              //     _id: { $in: project.students_id }
              //   })
              //     .then(students => {
              //       console.log(students);
              //       student_applied.push(students);
              //     })
              //     .catch(err => {
              //       console.log(err);
              //     });
              // });
              // console.log(student_applied);
              res.json({
                status: "success",
                project_details: projects
              });
            } else {
              res.json({
                stauts: "fail",
                project_details: "Error",
                students: "Error"
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        res.json({
          status: "fail",
          project_details: "Not valid faculty id",
          students: "Error"
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/add/:id", (req, res) => {
  const id = req.params.id;
  const idToken = req.headers.authorization;

  const project_details = req.body;

  Faculty.find({ google_id: { id: id, idToken: idToken } })
    .then(user => {
      user = user[0];
      if (user) {
        const project = new Project({
          title: project_details.title,
          duration: project_details.duration,
          studentIntake: project_details.studentIntake,
          description: project_details.description,
          stream: project_details.stream,
          faculty_id: user._id
        });

        user.project_list.push(project._id);

        project
          .save()
          .then(result => {
            user.save().then(ans => {
              res.json({
                save: "success",
                msg: "Your project has been successfully added"
              });
            });
          })
          .catch(err => {
            res.json({
              save: "fail",
              msg: " There was an error, Please try again!" //Display the messages in flash messages
            });
          });
      } else {
        res.json({
          save: "fail",
          msg: "User not found"
        });
      }
    })
    .catch(err => {
      res.json({
        save: "fail",
        msg: "Error in finding user"
      });
    });
});

router.post("/applied/:id", (req, res) => {
  const id = req.params.id;

  // const student_ids = req.body;
  9;
  const student_ids = req.body.student;

  student_ids.map(id => {
    mongoose.Types.ObjectId(id);
  });

  Student.find({
    _id: { $in: student_ids }
  })
    .then(students => {
      // console.log(students);
      res.json({
        status: "success",
        students: students
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/save_preference/:id", (req, res) => {
  const id = req.params.id;
  const student = req.body.student;
  const project_id = req.body.project_id;

  let student_ids = [];

  student.forEach(per => {
    student_ids.push(mongoose.Types.ObjectId(per._id));
  });

  Project.findById({ _id: project_id })
    .then(project => {
      console.log(project);
      project.students_id = student_ids;
      project
        .save()
        .then(result => {
          res.json({
            status: "success",
            msg: "Your preferences are saved"
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

router.post("/update/:id", (req, res) => {
  console.log(req.body);
  const project_id = mongoose.Types.ObjectId(req.params.id);

  const title = req.body.title;
  const duration = req.body.duration;
  const studentIntake = req.body.studentIntake;
  const description = req.body.description;

  Project.findById({ _id: project_id })
    .then(project => {
      project.title = title;
      project.duration = duration;
      project.studentIntake = studentIntake;
      project.description = description;

      project
        .save()
        .then(result => {
          res.json({
            status: "success",
            msg: "Your Project was successfully updated"
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

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  Project.findByIdAndRemove({ _id: id })
    .then(result => {
      res.json({
        status: "success",
        msg: "Project has been removed"
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
