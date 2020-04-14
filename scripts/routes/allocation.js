const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

router.post("/combine", (req, res) => {
    var promises = [];
    var students = [];
    var projects = [];
    promises.push(
        Student.find().then((student) => {
            student.sort((a, b) => {
                return b.gpa - a.gpa;
            });
            return student;
        })
    );
    promises.push(
        Project.find().then((project) => {
            project.sort((a, b) => {
                return a.students_id.length - b.students_id.length;
            });
            return project;
        })
    );
    Promise.all(promises).then((result) => {
        students = result[0];
        projects = result[1];
        studentIDS = students.map((val) => val._id);
        projectIDS = projects.map((val) => val._id);
        for (const project of projects) {
            const setA = new Set(project.students_id.map((val) => val.toString()));
            const setB = new Set(studentIDS.map((val) => val.toString()));
            const union = new Set([...setA, ...setB]);
            project.students_id = [...union];
            project.students_id = project.students_id.map((val) =>
                mongoose.Types.ObjectId(val)
            );
        }
        for (const student of students) {
            const setA = new Set(
                student.projects_preference.map((val) => val.toString())
            );
            const setB = new Set(projectIDS.map((val) => val.toString()));
            const union = new Set([...setA, ...setB]);
            student.projects_preference = [...union];
            student.projects_preference = student.projects_preference.map((val) =>
                mongoose.Types.ObjectId(val)
            );
        }
        res.json(students);
    });
});

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
        var curStudent, firstPreference;
        while (free.length > 0) {
            curStudent = free[0];
            firstPreference = curStudent.projects_preference[0];
            if (!firstPreference) {
                free.shift();
                curStudent = free[0];
                firstPreference = curStudent.projects_preference[0];
            }
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
                            firstPreference.students_id.indexOf(a) -
                            firstPreference.students_id.indexOf(b)
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
                        studentCurrentlyAlloted._id
                    );
                    var curStudentIndex = firstPreference.students_id.indexOf(
                        curStudent._id
                    );
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
        res.json(allocationStatus);
    });
});

module.exports = router;