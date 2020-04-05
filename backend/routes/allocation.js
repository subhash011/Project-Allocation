const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");

var weights = [3, 2, 1];
//0 --> faculty
//1 --> student
//2 --> CGPA

cron.schedule("*/2 * * * * *", function() {
    var projects = [];
    var students = [];
    var allocationStatus = new Map();
    var promises = [];
    promises.push(
        Project.find().then((projectList) => {
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
        Student.find().then((studentList) => {
            for (const student of studentList) {
                newStudent = {
                    student_id: student._id,
                    projectsList: student.projects_preference,
                    gpa: student.gpa,
                };
                students.sort((a, b) => {
                    return a.gpa - b.gpa;
                });
                students.push(newStudent);
            }
            return students;
        })
    );
    Promise.all(promises).then(() => {
        //here we have all students and projects sorted projects
        for (const project of projects) {
            var rank = 0;
            var studentRanks = [];
            for (
                let i = 0; i < project.studentsList.length && students.length > 0; i++
            ) {
                //faculty preference order
                rank += weights[0] * (i + 1);
                //rank of the student according to cgpa or index of the student
                var studentRank = students.indexOf(
                    students.find((object) => {
                        return object.student_id.equals(project.studentsList[i]);
                    })
                );
                rank += weights[2] * (studentRank + 1);
                //student preference number
                var projectRank = students[studentRank].projectsList.find((object) => {
                    return object.equals(project.project_id);
                });
                projectRank = students[studentRank].projectsList.indexOf(projectRank);
                rank += weights[1] * (projectRank + 1);
                studentRanks.push({
                    id: project.studentsList[i],
                    rank: rank,
                });
            }
            //here i have the ranks of all the students so i can sort now
            //student Ranks is the required map
            studentRanks.sort((a, b) => {
                return a.rank - b.rank;
            });
            if (studentRanks[0]) {
                allocationStatus.set(studentRanks[0].id, project.project_id);
                var studentID = studentRanks[0].id;
                var projectID = project.project_id;
                students = students.filter((object) => {
                    !object.student_id.equals(studentID);
                });
                projects = projects.filter((object) => {
                    !object.project_id.equals(projectID);
                });
                for (const project of projects) {
                    project.studentsList = project.studentsList.filter((object) => {
                        !object.equals(studentID);
                    });
                }
            }
        }
        console.log(allocationStatus);
    });
});

module.exports = router;