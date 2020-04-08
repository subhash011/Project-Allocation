const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

//cron is used to auto schedule the allocation process after the deadline
//this method can be made as a get method if we need to do the allocation from the front end
// cron.schedule("*/2 * * * * *", function() {

// });

router.post("/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.find({ google_id: { id: id, idToken: idToken } }).then(faculty => {
        if (faculty[0]) {
            const stream = faculty[0].stream;
            var projects = [];
            var students = [];
            var alloted = [];
            var free = [];
            //this allocation status is the map which is the answer
            var allocationStatus = new Map();
            var promises = [];
            promises.push(
                Project.find({ stream: stream }).then((projectList) => {
                    for (const project of projectList) {
                        newProj = {
                            project_id: project._id,
                            studentsList: project.students_id,
                        };
                        projects.push(newProj);
                    }
                    projects.sort((b, a) => {
                        return a.studentsList.length - b.studentsList.length;
                    });
                    return projects;
                })
            );
            promises.push(
                Student.find({ stream: stream }).then((studentList) => {
                    for (const student of studentList) {
                        newStudent = {
                            student_id: student._id,
                            projectsList: student.projects_preference,
                            gpa: student.gpa,
                        };
                        free.push(student._id);
                        //sorting projects according to cgpa so as to get the weight for CGPA
                        //if not needed make weights[2] = 0
                        students.push(newStudent);
                    }
                    students.sort((a, b) => {
                        return a.gpa - b.gpa;
                    });
                    return students;
                })
            );
            Promise.all(promises).then(() => {
                //here we have all students and projects sorted projects and students with CGPA
                while (allocationStatus.size != students.length) {
                    var curStudent = free[0];
                    var studentData = students.findIndex((val) => {
                        return val.student_id.equals(curStudent);
                    });
                    studentData = students[studentData];
                    if (!allocationStatus.has(studentData.projectsList[0])) {
                        allocationStatus.set(studentData.projectsList[0], curStudent);
                        alloted.push(curStudent);
                        free.filter((val) => {
                            !val.equals(curStudent);
                        });
                    } else {
                        var studentCurrentlyAlloted = allocationStatus.get(
                            studentData.projectsList[0]
                        );
                        var projectData = projects.findIndex((val) => {
                            return val.project_id.equals(studentData.projectsList[0]);
                        });
                        projectData = projects[projectData];
                        var indexCurrentAllocation = projectData.studentsList.findIndex(
                            (val) => {
                                return val.equals(studentCurrentlyAlloted);
                            }
                        );
                        var indexNotAlloted = projectData.studentsList.findIndex((val) => {
                            return val.equals(curStudent);
                        });
                        if (indexCurrentAllocation > indexNotAlloted) {
                            allocationStatus.set(studentData.projectsList[0], curStudent);
                            alloted.filter((val) => {
                                !val.equals(studentCurrentlyAlloted);
                            });
                            free.filter((val) => {
                                !val.equals(curStudent);
                            });
                            alloted.push(curStudent);
                            free.push(studentCurrentlyAlloted);
                        } else {
                            //Pop the 0th preference from the array of the curStudent.
                            studentData.projectsList.shift();
                        }
                    }
                }
                promises = [];
                allocationStatus.forEach((value, key) => {
                    promises.push(
                        Project.findByIdAndUpdate(key, {
                            student_alloted: value,
                        })
                        .then((project) => {
                            return project;
                        })
                        .catch(() => {
                            res.json({
                                message: "error",
                                result: null
                            })
                        })
                    );
                    promises.push(
                        Student.findByIdAndUpdate(value, {
                            project_alloted: key,
                        })
                        .then((student) => {
                            return student;
                        })
                        .catch(() => {
                            res.json({
                                message: "error",
                                result: null
                            })
                        })
                    );
                });
                Promise.all(promises).then((result) => {
                    res.json({
                        message: "success",
                        result: allocationStatus
                    })
                });
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            })
        }
    })
})

module.exports = router;