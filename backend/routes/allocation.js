const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

// combine opted and non opted students for each project to get final csv (preference of faculty)
function combineProjects(projects) {
    let studentsPreferred = {};
    let studentsNotPreferred = {};
    for (let project of projects) {
        studentsPreferred[project._id.toString()] = project.students_id;
        studentsNotPreferred[project._id.toString()] = project.not_students_id;
        project.students_id = [...studentsPreferred[project._id.toString()], ...studentsNotPreferred[project._id.toString()]];
    }
    return projects;
}

// combine selected and not selected projects for each student to get final csv (preference of student)
function combineStudents(projects, students) {
    for (const student of students) {
        let preferredProjects = student.projects_preference.map(val => val.toString());
        let projectsNotPreferred = projects.filter(val => {
            return !preferredProjects.includes(val._id.toString());
        });
        let sortedPreferences = projectsNotPreferred.sort((a, b) => {
            return (a.not_students_id.indexOf(student._id) + a.students_id.length) - (b.not_students_id.indexOf(student._id) + b.students_id.length);
        });
        sortedPreferences = sortedPreferences.map(val => val._id.toString());
        student.projects_preference = [...student.projects_preference, ...sortedPreferences];
        student.projects_preference = student.projects_preference.map((val) =>
            mongoose.Types.ObjectId(val)
        );
    }
    return students;
}

// start allocation
router.post("/start/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let promises = [];
        let projects = req.body.projects;
        let students;
        let projectIDs = projects.map((val) => val._id);
        let stream;
        const selectAdmins = {
            isAdmin: 1,
            adminProgram: 1
        };
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select(selectAdmins);
        if (!(faculty && faculty.isAdmin)) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        stream = faculty.adminProgram;
        const projectsCondition = {
            stream: stream,
            _id: {$in: projectIDs}
        };

        promises.push(
            Project.find(projectsCondition).then((projectList) => {
                let projects = projectList;
                projects.forEach(project => {
                    project.tempStudentsIDs = project.students_id;
                    project.tempNotStudentsIDs = project.not_students_id;
                });
                projects.sort((a, b) => {
                    return a.students_id.length - b.students_id.length;
                });
                return projects;
            })
        );
        promises.push(
            Student.find({stream: stream}).then((studentList) => {
                let students = studentList;
                students.sort((a, b) => {
                    return b.gpa - a.gpa;
                });
                students = students.filter((val) => val.isRegistered);
                return students;
            })
        );
        [projects, students] = await Promise.all(promises);

        // Start Gale shapely
        combineStudents(projects, students);
        combineProjects(projects);
        let allotted = [];
        const allocationStatus = {};
        let free = [...students];
        let curStudent, firstPreference, firstProject;
        while (free.length > 0) {
            curStudent = free[0];
            firstPreference = curStudent.projects_preference[0];
            if (!firstPreference) {
                free.shift();
                continue;
            }
            firstProject = projects.find((val) => {
                return val.equals(firstPreference.toString());
            });
            if (!firstProject) {
                curStudent.projects_preference.shift();
                continue;
            }
            if (!allocationStatus[firstPreference]) {
                allocationStatus[firstPreference] = [];
                allocationStatus[firstPreference].push(curStudent);
                free = free.filter((val) => {
                    return !val.equals(curStudent);
                });
                allotted.push(curStudent);
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
                    allotted.push(curStudent);
                } else {
                    const studentCurrentlyAllotted =
                        allocationStatus[firstPreference._id][allocationStatus[firstPreference._id].length - 1];
                    const currentlyAllottedIndex = firstProject.students_id.indexOf(
                        studentCurrentlyAllotted._id
                    );
                    const curStudentIndex = firstProject.students_id.indexOf(
                        curStudent._id
                    );
                    if (curStudentIndex < currentlyAllottedIndex) {
                        allocationStatus[firstPreference].pop();
                        studentCurrentlyAllotted.projects_preference.shift();
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
                        allotted = allotted.filter((val) => {
                            return !val.equals(studentCurrentlyAllotted);
                        });
                        free.push(studentCurrentlyAllotted);
                        allotted.push(curStudent);
                    } else {
                        curStudent.projects_preference.shift();
                    }
                }
            }
        }
        // end Gale shapely

        let populateFac = {
            path: "faculty_id",
            select: "_id name",
            model: Faculty
        };
        let populateStud = {
            path: "students_id",
            select: {name: 1, roll_no: 1, project_alloted: 1},
            model: Student,
            populate: {
                path: "project_alloted",
                select: {title: 1, faculty_id: 1},
                model: Project,
                populate: {
                    path: "faculty_id",
                    select: {name: 1},
                    model: Faculty
                }
            }
        };
        let populateStudAllotted = {
            path: "student_alloted",
            select: "name roll_no gpa",
            model: Student
        };
        projects = await Project.find({stream: stream})
                                .populate(populateFac)
                                .populate(populateStud)
                                .populate(populateStudAllotted);
        let projectAllocation = [];
        for (const project of projects) {
            let studentsAllotted = [];
            const allocation = allocationStatus[project._id.toString()];
            if (allocation) {
                studentsAllotted = allocation.map((val) => {
                    return {
                        name: val.name,
                        roll_no: val.roll_no,
                        gpa: val.gpa
                    };
                });
            } else {
                studentsAllotted = [];
            }
            const newProj = {
                _id: project._id,
                faculty_id: project.faculty_id._id,
                title: project.title,
                description: project.description,
                stream: project.stream,
                duration: project.duration,
                faculty: project.faculty_id.name,
                studentIntake: project.studentIntake,
                numberOfPreferences: project.students_id.length,
                student_alloted: studentsAllotted,
                students_id: project.students_id,
                not_students_id: project.not_students_id,
                isIncluded: project.isIncluded
            };
            projectAllocation.push(newProj);
        }
        let resultMap = {};
        for (const key in allocationStatus) {
            if (allocationStatus.hasOwnProperty(key)) {
                resultMap[key] = allocationStatus[key].map(
                    (val) => val._id
                );
            }
        }
        res.status(200).json({
            statusCode: 500,
            message: "success",
            result: {
                projects: projectAllocation,
                allocationMap: resultMap
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: e.toString()
        });
    }
});

module.exports = router;
