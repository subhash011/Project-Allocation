const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const oauth = require("../config/oauth");

var email = ["subhash011011@gmail.com"];
var branches = ["CSE", "EE", "ME", "CE"];
Array.prototype.contains = function(v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i]) && this[i] != "") {
            arr.push(this[i]);
        }
    }
    return arr;
}

router.get("/faculty/details/:name", (req, res) => {
    var str = req.params.name;
    console.log(str);
    if (str == "" || str == null) {
        Faculty.find().then(faculties => {
            res.json({
                message: "success",
                result: faculties
            })
        }).catch(() => {
            res.status(500);
        })
    } else {
        Faculty.find({ name: { $regex: str, $options: 'i' } }).then(faculty => {
            res.json({
                message: "success",
                result: faculty
            })
        }).catch(() => {
            res.status(500);
        })
    }
});

router.get("/student/details", (req, res) => {
    var streamwise = [];
    var student = [];
    Student.find().then(students => {
        if (students) {
            for (const branch of branches) {
                var temp = students.filter(student => {
                    return student.stream == branch;
                });
                if (temp[0] != null) {
                    streamwise.push(temp[0]);
                }
            }
            res.json({
                message: "success",
                result: streamwise
            });
        } else {
            res.json({
                message: "success",
                result: "no-students"
            })
        }
    }).catch(err => {
        res.status(500);
    })
});

router.get("/faculty/details", (req, res) => {
    var streamwise = [];
    Faculty.find().then(faculties => {
        if (faculties) {
            for (const branch of branches) {
                var temp = faculties.filter(faculty => {
                    return faculty.stream == branch;
                });
                if (temp[0] != null) {
                    streamwise.push(temp[0]);
                }
            }
            res.json({
                message: "success",
                result: streamwise
            });
        } else {
            res.json({
                message: "success",
                result: "no-faculties"
            })
        }
    }).catch(err => {
        res.status(500);
    })
})

router.delete("/student/:id", (req, res) => {
    //start authentication here
    const id = mongoose.Types.ObjectId(req.params.id);
    var promises = [];
    Student.findByIdAndDelete(id).then(student => {
            if (student)
                return student.projects_preference;
            else
                return null;
        }).then(projects => {
            if (projects) {
                for (const project of projects) {
                    var projectid = mongoose.Types.ObjectId(project);
                    promises.push(
                        Project.findById(projectid).then(project => {
                            project.students_id = project.students_id.filter(val => !val.equals(id));
                            project.save().then((project) => {
                                return project;
                            });
                        })
                    );
                }
                Promise.all(promises).then(result => {
                    res.json({ result: result, message: "success" });
                });
            } else {
                res.json({ message: "error" });
            }
        }).catch(err => {
            res.status(500);
        })
        //end authentication here
});

router.delete("/faculty/:id", (req, res) => {
    //start authentication here
    const id = mongoose.Types.ObjectId(req.params.id);
    Faculty.findByIdAndDelete(id).then(faculty => {
        if (!faculty) {
            res.json({ result: "no-faculty", message: "success" });
            return;
        }
        var projects = faculty.project_list;
        var promises = [];
        for (const project of projects) {
            var project_id = mongoose.Types.ObjectId(project);
            promises.push(
                Project.findByIdAndDelete(project_id).then(project => {
                    return project;
                })
            );
        }
        Promise.all(promises).then(result => {
            return result;
        }).catch(err => {
            res.status(500);
        }).then(projects => {
            promises = []
            projects_id = projects.map(val => String(val._id));
            students_id = projects.map(val => val.students_id);
            var students = []
            for (const ids of students_id) {
                var studentid = [String(ids)];
                students = [...students, ...studentid];
            }
            students_id = students.unique();
            for (const student of students_id) {
                studentID = mongoose.Types.ObjectId(student);
                promises.push(
                    Student.findById(studentID).then(student => {
                        student.projects_preference = student.projects_preference.filter(
                            val => !projects_id.includes(String(val))
                        );
                        student.projects_preference.map(val => mongoose.Types.ObjectId(val));
                        student.save().then(student => {
                            return student;
                        });
                        return student._id;
                    })
                );
            }
            Promise.all(promises).then(result => {
                res.json({ result: result, message: "success" });
            }).catch(err => {
                res.status(500);
            })
        }).catch(err => {
            res.status(500);
        })
    });
    //end authentication here
});

module.exports = router;