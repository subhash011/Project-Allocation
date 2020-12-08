const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");

function combineProjects(projects, students) {
    let studentIDS = students.map((val) => val._id);
    projects.map((val) => val._id);
    for (const project of projects) {
        const setA = new Set(project.students_id.map((val) => val.toString()));
        const setB = new Set(studentIDS.map((val) => val.toString()));
        const union = new Set([...setA, ...setB]);
        project.students_id = [...union];
        project.students_id = project.students_id.map((val) =>
            mongoose.Types.ObjectId(val)
        );
    }
    return projects;
}

function combineStudents(projects, students) {
    students.map((val) => val._id);
    let projectIDS = projects.map((val) => val._id);
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
    return students;
}

router.post("/start", (req, res) => {
    let projects = [];
    let students = [];
    let alloted = [];
    let free = [];
    const allocationStatus = {};
    let promises = [];
    promises.push(
        Project.find().then((projectList) => {
            projects = projectList;
            projects.sort((b, a) => {
                return a.students_id.length - b.students_id.length;
            });
            return projects;
        })
    );
    promises.push(
        Student.find().then((studentList) => {
            students = studentList;
            students.sort((a, b) => {
                return b.gpa - a.gpa;
            });
            return students;
        })
    );
    Promise.all(promises).then(() => {
        combineStudents(projects, students);
        combineProjects(projects, students);
        free = [...students];
        let curStudent, firstPreference, firstProject;
        while (free.length > 0) {
            curStudent = free[0];
            firstPreference = curStudent.projects_preference[0];
            firstProject = projects.find((val) => {
                return val.equals(firstPreference.toString());
            });
            if (!firstPreference) {
                curStudent.projects_preference.shift();
                continue;
            }
            if (!allocationStatus[firstPreference]) {
                allocationStatus[firstPreference] = [];
                allocationStatus[firstPreference].push(curStudent);
                free = free.filter((val) => {
                    return !val.equals(curStudent);
                });
                alloted.push(curStudent);
            } else {
                if (
                    allocationStatus[firstPreference].length < firstProject.studentIntake
                ) {
                    allocationStatus[firstPreference].push(curStudent);
                    allocationStatus[firstPreference].sort((a, b) => {
                        return (
                            firstProject.students_id.indexOf(a._id) -
                            firstProject.students_id.indexOf(b._id)
                        );
                    });
                    free = free.filter((val) => {
                        return !val.equals(curStudent);
                    });
                    alloted.push(curStudent);
                } else {
                    const studentCurrentlyAlloted =
                        allocationStatus[firstPreference._id][
                        allocationStatus[firstPreference._id].length - 1
                            ];
                    const currentlyAllotedIndex = firstProject.students_id.indexOf(
                        studentCurrentlyAlloted._id
                    );
                    const curStudentIndex = firstProject.students_id.indexOf(
                        curStudent._id
                    );
                    if (curStudentIndex < currentlyAllotedIndex) {
                        allocationStatus[firstPreference].pop();
                        studentCurrentlyAlloted.projects_preference.shift();
                        allocationStatus[firstPreference].push(curStudent);
                        allocationStatus[firstPreference].sort((a, b) => {
                            return (
                                firstProject.students_id.indexOf(a._id) -
                                firstProject.students_id.indexOf(b._id)
                            );
                        });
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
        //update dbs here
        promises = [];
        for (const key in allocationStatus) {
            if (allocationStatus.hasOwnProperty(key)) {
                const studentsList = allocationStatus[key];
                for (const student of studentsList) {
                    promises.push(
                        Student.findByIdAndUpdate(student._id, {
                            project_alloted: mongoose.Types.ObjectId(key),
                        }).then((student) => {
                            return student;
                        })
                    );
                }
            }
        }
        Promise.all(promises).then(() => {
            promises = [];
            for (const key in allocationStatus) {
                if (allocationStatus.hasOwnProperty(key)) {
                    const studentsList = allocationStatus[key].map((val) =>
                        mongoose.Types.ObjectId(val._id)
                    );
                    promises.push(
                        Project.findByIdAndUpdate(mongoose.Types.ObjectId(key), {
                            student_alloted: studentsList,
                        }).then((project) => {
                            return project;
                        })
                    );
                }
            }
            Promise.all(promises).then(() => {
                Object.keys(allocationStatus).map(function (key, value) {
                    allocationStatus[key] = allocationStatus[key].map((val) => val.name);
                });
                res.json(allocationStatus);
            });
        });
    });
});

module.exports = router;
