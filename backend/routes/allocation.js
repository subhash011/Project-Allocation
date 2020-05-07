const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");

function combineProjects(projects, students) {
    students = students;
    projects = projects;
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
    return projects;
}

function combineStudents(projects, students) {
    students = students;
    projects = projects;
    studentIDS = students.map((val) => val._id);
    projectIDS = projects.map((val) => val._id);
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



router.post("/start/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    var projects = [];
    var students = [];
    var alloted = [];
    var free = [];
    var allocationStatus = {};
    var promises = [];
    var projects = req.body.projects;
    var pids = [];
    var stream;
    pids =  projects.map(val => val._id);
    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then((faculty) => {
            if (faculty) {
                if (faculty.isAdmin) {
                    stream = faculty.adminProgram;
                    Project.find({stream:stream}).then(projects => {
                        for (const project of projects) {
                            project.student_alloted = [];
                            promises.push(
                                project.save().then(project => {
                                    return project;
                                })
                            );
                        }
                        Promise.all(promises).then(result => {
                            promises = [];
                            Student.find({stream:stream}).then(students => {
                                for (const student of students) {
                                    student.project_alloted = null;
                                    promises.push(
                                        student.save().then(student => {
                                            return student;
                                        })
                                    )
                                }
                                Promise.all(promises).then(result=>{
                                    promises.push(
                                        Project.find({ stream: stream }).then((projectList) => {
                                            projectList = projectList.filter(val => {
                                                return pids.indexOf(val._id.toString()) != -1;
                                            })
                                            projects = projectList;
                                            projects.sort((a, b) => {
                                                return a.students_id.length - b.students_id.length;
                                            });
                                            return projects;
                                        })
                                    );
                                    promises.push(
                                        Student.find({ stream: stream }).then((studentList) => {
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
                                        var curStudent, firstPreference, firstProject;
                                        while (free.length > 0) {
                                            curStudent = free[0];
                                            firstPreference = curStudent.projects_preference[0];
                                            if(!firstPreference){
                                                free.shift();
                                                continue;
                                            }
                                            firstProject = projects.find((val) => {
                                                return val.equals(firstPreference.toString());
                                            });
                                            if(!firstProject){
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
                                                    allocationStatus[firstPreference].length <
                                                    firstProject.studentIntake
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
                                                    var studentCurrentlyAlloted =
                                                        allocationStatus[firstPreference._id][
                                                            allocationStatus[firstPreference._id].length - 1
                                                        ];
                                                    var currentlyAllotedIndex = firstProject.students_id.indexOf(
                                                        studentCurrentlyAlloted._id
                                                    );
                                                    var curStudentIndex = firstProject.students_id.indexOf(
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
                                        Promise.all(promises).then((result) => {
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
                                            Promise.all(promises)
                                                .then((result) => {
                                                    Object.keys(allocationStatus).map(function(key, value) {
                                                        allocationStatus[key] = allocationStatus[key].map(
                                                            (val) => val.name
                                                        );
                                                    });
                                                    Project.find({stream:stream})
                                                    .populate("faculty_id", null, Faculty)
                                                    .populate("student_alloted", null, Student)
                                                    .then((projects) => {
                                                        var arr = [];
                                                        for (const project of projects) {
                                                            const newProj = {
                                                                _id:project._id,
                                                                faculty_id:project.faculty_id,
                                                                title: project.title,
                                                                description: project.description,
                                                                stream: project.stream,
                                                                duration: project.duration,
                                                                faculty: project.faculty_id.name,
                                                                numberOfPreferences: project.students_id.length,
                                                                student_alloted: project.student_alloted,
                                                                students_id:project.students_id
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
                                                })
                                                .catch(() => {
                                                    res.json({
                                                        message: "fail",
                                                    });
                                                });
                                        });
                                    });
                                })
                            })
                        })
                    })
                }
            } else {
                res.json({
                    message: "invalid-token",
                    result: null,
                });
            }
        })
        .catch((err) => {
            res.json({
                message: "invalid-token",
                result: null,
            });
        });
});

module.exports = router;


                    