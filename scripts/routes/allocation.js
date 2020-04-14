const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

router.post("/start", (req, res) => {
    var projects = [];
    var students = [];
    var alloted = [];
    var free = [];
    var allocationStatus = {};
    var promises = [];
    promises.push(
        Project.find()
        .populate("students_id", null, Student)
        .then((projectList) => {
            projects = projectList;
            projects.sort((b, a) => {
                return a.students_id.length - b.students_id.length;
            });
            return projects;
        })
    );
    promises.push(
        Student.find()
        .populate("projects_preference", null, Project)
        .then((studentList) => {
            students = studentList;
            students.sort((a, b) => {
                return a.gpa - b.gpa;
            });
            free = [...students];
            return students;
        })
    );
    Promise.all(promises).then(() => {
        //here we have all students and projects sorted projects and students with CGPA
        while (free.length > 0) {
            const curStudent = free[0];
            const firstPreference = curStudent.projects_preference[0];
            if (!allocationStatus[firstPreference._id]) {
                allocationStatus[firstPreference._id] = [];
                allocationStatus[firstPreference._id].push(curStudent);
                free = free.filter((val) => {
                    return !val.equals(curStudent);
                });
                alloted.push(curStudent);
            } else {
                if (
                    allocationStatus[firstPreference._id].length <
                    firstPreference.studentIntake
                ) {
                    allocationStatus[firstPreference._id].push(curStudent);
                    allocationStatus[firstPreference._id].sort((a, b) => {
                        return (
                            firstPreference.students_id.indexOf(b) -
                            firstPreference.students_id.indexOf(a)
                        );
                    });
                    free = free.filter((val) => {
                        return !val.equals(curStudent);
                    });
                    alloted.push(curStudent);
                } else {
                    var studentCurrentlyAlloted =
                        allocationStatus[firstPreference._id][
                            allocationStatus[firstPreference._id].length - 1
                        ];
                    var currentlyAllotedIndex = firstPreference.students_id.indexOf(
                        studentCurrentlyAlloted
                    );
                    var curStudentIndex = firstPreference.students_id.indexOf(curStudent);
                    if (curStudentIndex < currentlyAllotedIndex) {
                        allocationStatus[firstPreference._id].pop();
                        allocationStatus[firstPreference._id].push(curStudent);
                        free = free.filter((val) => {
                            return !val.equals(curStudent);
                        });
                        alloted = alloted.filter((val) => {
                            return !val.equals(studentCurrentlyAlloted);
                        });
                        free.push(studentCurrentlyAlloted);
                        alloted.push(curStudent);
                    } else {
                        curStudent.projects_preference.shift();
                    }
                }
            }
        }
        Object.keys(allocationStatus).map(function(key, value) {
            allocationStatus[key] = allocationStatus[key].map((val) => val.name);
        });
        res.send(allocationStatus);
    });
});

module.exports = router;