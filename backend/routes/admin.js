const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const Programs = require("../models/Programs");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csv = require("fast-csv");

// check if the admin has uploaded the CSV of student list in the right format
function validateCsvData(rows) {
    if (rows[0].length >= 4) {
        return "Only three columns(Name, Roll no., Gpa) are allowed. More than 3 columns detected.";
    }

    const dataRows = rows.slice(1, rows.length);
    for (let i = 0; i < dataRows.length; i++) {
        const rowError = validateCsvRow(dataRows[i]);
        if (rowError) {
            return `${rowError} on row ${i + 1}`;
        }
    }

}

// validate rows of the csv of student list uploaded by admin
function validateCsvRow(row) {
    if (!row[0]) {
        return "invalid name";
    } else if (!Number.isInteger(Number(row[1]))) {
        return "invalid roll number";
    } else if (!Number(row[2])) {
        return "invalid gpa";
    }

}

// get one row student details to generate CSV
function studentPref(total, student) {
    return total + "|" + student.name + "|" + student.roll_no;
}

// get one row project details to generate CSV
function projectPref(total, project) {
    return total + "|" + project.title;
}

// combine opted and non opted students for each project to get final csv (preference of faculty)
function combineProjects(projects) {
    for (const project of projects) {
        const setA = new Set(project.students_id.map((val) => JSON.stringify(val)));
        const setB = new Set(project.not_students_id.map(val => JSON.stringify(val)));
        const union = new Set([...setA, ...setB]);
        project.students_id = [...union];
        project.students_id = project.students_id.map((val) => JSON.parse(val));
        project.students_id = project.students_id
            .reduce(studentPref, "")
            .substring(1);
    }
    return projects;
}

// combine selected and not selected projects for each student to get final csv (preference of student)
function combineStudents(projects, students) {
    projects = projects.map((val) => JSON.stringify(val));
    for (const student of students) {
        const setA = new Set(
            student.projects_preference.map((val) => JSON.stringify(val))
        );
        const setB = new Set(projects);
        const union = new Set([...setA, ...setB]);
        student.projects_preference = [...union];
        student.projects_preference = student.projects_preference.map((val) =>
            JSON.parse(val)
        );
        student.projects_preference = student.projects_preference
            .reduce(projectPref, "")
            .substring(1);
    }
    return students;
}

function generateCSVProjects(data, program_name) {
    let headers = "Title|Faculty|Student intake|Preference count|";
    if (!fs.existsSync("./CSV/projects/")) {
        fs.mkdirSync("./CSV/projects", {recursive: true});
    }
    const file = path.resolve(__dirname, `../CSV/projects/${program_name}.csv`);
    if (!data[0]) {
        headers = headers.substring(0, headers.length - 1) + "\n";
        fs.writeFile(file, headers, (err) => {
            if (err) {
                return "error";
            }
            return "success";
        });
        return;
    }
    let s_length = data[0].students_id.split("|").length / 2;
    if (data[0].students_id === "") {
        s_length = 0;
        headers = headers.substring(0, headers.length - 1) + "\n";
    }
    for (let ind = 1; ind <= s_length; ind++) {
        headers +=
            ind === s_length
                ? `Preference.${ind} ( Name )|Preference.${ind} ( Roll no. )|\n`
                : `Preference.${ind} ( Name )|Preference.${ind} ( Roll no. )|`;
    }


    let str = "";
    for (const fields of data) {
        str +=
            fields.title +
            "|" +
            fields.faculty +
            "|" +
            fields.studentIntake +
            "|" +
            fields.preferenceCount +
            "|" +
            fields.students_id +
            "\n";
    }

    const write_obj = headers + str;
    fs.writeFile(file, write_obj, (err) => {
        if (err) {
            return "error";
        }
        return "success";
    });
}

function generateCSVStudents(data, program_name) {
    let headers = "Name|Roll no.|GPA|Preference count|";
    if (!fs.existsSync("./CSV/students/")) {
        fs.mkdirSync("./CSV/students", {recursive: true});
    }
    const file = path.resolve(__dirname, `../CSV/students/${program_name}.csv`);
    if (!data[0]) {
        headers = headers.substring(0, headers.length - 1) + "\n";
        fs.writeFile(file, headers, (err) => {
            if (err) {
                return "error";
            }
            return "success";
        });
        return;
    }
    let p_length = data[0].projects_preference.split("|").length;
    if (data[0].projects_preference === "") {
        p_length = 0;
        headers = headers.substring(0, headers.length - 1) + "\n";
    }
    for (let ind = 1; ind <= p_length; ind++) {
        headers += ind === p_length ? `Preference.${ind}\n` : `Preference.${ind}|`;
    }
    let str = "";
    for (const fields of data) {
        str +=
            fields.name +
            "|" +
            fields.roll_no +
            "|" +
            fields.gpa +
            "|" +
            fields.preferenceCount +
            "|" +
            fields.projects_preference +
            "\n";
    }

    const write_obj = headers + str;
    fs.writeFile(file, write_obj, (err) => {
        if (err) {
            return "error";
        }
        return "success";
    });
}

function generateCSVAllocation(data, program_name) {
    let headers = "Title|Faculty|Student Intake|";
    if (!fs.existsSync("./CSV/allocation/")) {
        fs.mkdirSync("./CSV/allocation", {recursive: true});
    }
    const file = path.resolve(__dirname, `../CSV/allocation/${program_name}.csv`);
    const allotedCount = data.map((val) => {
        return val.allotedCount;
    });
    const maxAlloted = Math.max(...allotedCount);
    let i;
    for (i = 1; i <= maxAlloted; i++) {
        headers += "Student Name ( " + i + " )|" + "Roll no. ( " + i + " )|" + "Preference of the awarded project ( " + i + " )|";
    }
    headers = headers.substring(0, headers.length - 1) + "\n";
    if (maxAlloted === 0) {
        fs.writeFile(file, headers, (err) => {
            if (err) {
                return "error";
            }
            return "success";
        });
        return;
    }
    let value = "";
    for (const status of data) {
        const arr = [status.title, status.faculty, status.studentIntake.toString()];
        const students = status.student_alloted;
        for (i = 0; i < maxAlloted; i++) {
            if (i < students.length) {
                let studentPreference = status.studentPreference[i];
                studentPreference = studentPreference !== 0 ? studentPreference.toString() : "";
                arr.push(students[i].name, students[i].roll_no, studentPreference);
            } else {
                arr.push("", "", "");
            }
        }
        value += arr.join("|") + "\n";
        const write_obj = headers + value;
        fs.writeFile(file, write_obj, (err) => {
            if (err) {
                return "error";
            }
            return "success";
        });
    }
}

router.get("/info/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (faculty) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            if (admin) {
                let startDate;
                if (admin.deadlines.length) {
                    startDate = admin.startDate;
                }

                res.json({
                    status: "success",
                    stage: admin.stage,
                    deadlines: admin.deadlines,
                    startDate: startDate,
                    projectCap: admin.project_cap,
                    studentCap: admin.student_cap,
                    stream: admin.stream,
                    email: faculty.email,
                    studentsPerFaculty: admin.studentsPerFaculty,
                    studentCount: admin.studentCount
                });
            } else {
                res.json({
                    status: "fail",
                    stage: 0,
                    deadlines: ""
                });
            }
        } else {
            res.json({
                status: "fail",
                stage: 0,
                deadlines: ""
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            stage: 0,
            deadlines: ""
        });
    }
});

router.get("/project/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id})
                .lean()
                .select("stream");
            const stream = admin.stream;
            let projects = await Project.find({stream: stream})
                .lean()
                .populate({
                    path: "faculty_id",
                    select: "_id name",
                    model: Faculty
                })
                .populate({
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
                })
                .populate({
                    path: "student_alloted",
                    select: "name roll_no gpa",
                    model: Student
                });
            const arr = [];
            for (const project of projects) {
                const newProj = {
                    _id: project._id,
                    title: project.title,
                    faculty_id: project.faculty_id._id,
                    description: project.description,
                    stream: project.stream,
                    studentIntake: project.studentIntake,
                    duration: project.duration,
                    faculty: project.faculty_id.name,
                    numberOfPreferences: project.students_id.length,
                    student_alloted: project.student_alloted,
                    students_id: project.students_id,
                    isIncluded: project.isIncluded
                };
                arr.push(newProj);
            }
            res.json({
                message: "success",
                result: arr
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.status(500);
    }
});

router.get("/stream_email/faculty/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const emails = [];
        let programAdmin;
        let faculty = await Faculty.findOne({
            google_id: {
                id: id,
                idToken: idToken
            }
        }).lean().select("adminProgram programs");
        const stream = faculty.adminProgram;
        for (const program of faculty.programs) {
            if (program.short === stream) {
                programAdmin = program;
                break;
            }
        }
        let faculties = await Faculty.find({programs: {$elemMatch: programAdmin}}).lean().select("email");
        for (const fac of faculties) {
            emails.push(fac.email);
        }
        res.json({
            status: "success",
            result: emails,
            stream: stream,
            streamFull: programAdmin.full
        });
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/stream_email/student/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const emails = [];
        let programAdmin;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("adminProgram programs");
        const stream = faculty.adminProgram;
        for (const program of faculty.programs) {
            if (program.short === stream) {
                programAdmin = program;
                break;
            }
        }
        let students = await Student.find({stream: stream})
            .lean()
            .select("email");
        for (const student of students) {
            emails.push(student.email);
        }

        res.json({
            status: "success",
            result: emails,
            stream: stream,
            streamFull: programAdmin.full
        });
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/all/info", async (req, res) => {
    try {
        const result = {};
        const promises = [];
        let maps = await Programs.find().lean();
        let branches = maps.map((val) => val.short);
        let admins = await Admin.find();
        if (admins) {
            for (const branch of branches) {
                promises.push(
                    Admin.findOne({stream: branch}).then((admin) => {
                        result[branch] = admin;
                        return admin;
                    })
                );
            }
            await Promise.all(promises);
            res.json({
                message: "success",
                result: result
            });
        } else {
            res.json({
                message: "error",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "error",
            result: null
        });
    }
});

router.get("/members/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const promises = [];
        const users = {};
        let programAdmin = {};
        let faculty = await Faculty.findOne({
            google_id: {
                id: id,
                idToken: idToken
            }
        }).lean().select("_id programs isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            for (const program of faculty.programs) {
                if (program.short === admin.stream) {
                    programAdmin = program;
                }
            }
            promises.push(
                Faculty.find({programs: {$elemMatch: programAdmin}})
                    .lean()
                    .populate({
                        path: "project_list",
                        select: {isIncluded: 1, studentIntake: 1, stream: 1},
                        model: Project
                    })
                    .then((faculties) => {
                        users.faculties = faculties.map((val) => {
                            let projectCapErr = false;
                            let studentCapErr = false;
                            let studentsPerFacultyErr = false;
                            let projects = val.project_list;
                            let includedProjects = 0;
                            let total_projects = 0;
                            projects = projects.filter((project) => {
                                if (project.stream === admin.stream) {
                                    includedProjects += project.isIncluded ? 1 : 0;
                                    total_projects += 1;
                                    return project;
                                }
                            });
                            if (projects.length > admin.project_cap) {
                                projectCapErr = true;
                            }

                            let student_count = 0;

                            let total = 0;
                            let included = 0;
                            let temp = 0;
                            for (const project of projects) {
                                student_count += project.studentIntake;
                                if (project.studentIntake > admin.student_cap) {
                                    studentCapErr = true;
                                }

                                temp = project.studentIntake;
                                if (project.isIncluded) {
                                    total += temp;
                                    included += temp;
                                } else {
                                    total += temp;
                                }
                            }

                            if (student_count > admin.studentsPerFaculty) {
                                studentsPerFacultyErr = true;
                            }

                            return {
                                _id: val._id,
                                name: val.name,
                                noOfProjects: total_projects,
                                email: val.email,
                                total_studentIntake: total,
                                included_studentIntake: included,
                                project_cap: projectCapErr,
                                student_cap: studentCapErr,
                                studentsPerFaculty: studentsPerFacultyErr,
                                includedProjectsCount: includedProjects
                            };
                        });
                        return users.faculties;
                    })
            );
            promises.push(
                Student.find({stream: admin.stream})
                    .lean()
                    .populate({
                        path: "projects_preference",
                        model: Project,
                        populate: {
                            path: "faculty_id",
                            model: Faculty
                        }
                    })
                    .then((students) => {
                        users.students = students.map((val) => {
                            const project = val.projects_preference.map((val) => {
                                return {
                                    faculty_name: val.faculty_id.name,
                                    title: val.title,
                                    description: val.description,
                                    faculty_email: val.faculty_id.email
                                };
                            });

                            return {
                                _id: val._id,
                                name: val.name,
                                projects_preference: project,
                                email: val.email,
                                gpa: val.gpa,
                                project_alloted: val.project_alloted,
                                isRegistered: val.isRegistered
                            };
                        });
                        return users.students;
                    })
            );
            await Promise.all(promises);
            res.json({
                message: "success",
                result: users
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "error",
            result: null
        });
    }
});

router.get("/export_projects/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            const programName = admin.stream;
            const promises = [];

            promises.push(
                Student.find().lean().then((students) => {
                    students.sort((a, b) => {
                        return b.gpa - a.gpa;
                    });

                    return students.map((val) => {
                        return {
                            _id: val._id,
                            name: val.name,
                            roll_no: val.roll_no
                        };
                    });
                })
            );

            promises.push(
                Project.find({stream: programName})
                    .populate("faculty_id", {name: 1}, Faculty)
                    .populate({
                        path: "students_id",
                        select: {_id: 1, name: 1, roll_no: 1},
                        model: Student
                    })
                    .populate({
                        path: "not_students_id",
                        select: {_id: 1, name: 1, roll_no: 1},
                        model: Student
                    })
                    .populate("student_alloted", {name: 1, roll_no: 1}, Student)
                    .then((data) => {
                        return data.map((val) => {
                            return {
                                title: val.title,
                                faculty: val.faculty_id.name,
                                studentIntake: val.studentIntake,
                                preferenceCount: val.students_id.length,
                                students_id: val.students_id,
                                not_students_id: val.not_students_id
                            };
                        });
                    })
            );

            let result = await Promise.all(promises);
            const projects = result[1];
            const data = combineProjects(projects);
            generateCSVProjects(data, programName);
            res.json({
                message: "success"
            });

        } else {
            res.json({
                message: "invalid-token"
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token"
        });
    }
});

router.get("/export_allocation/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            const stream = admin.stream;
            let projects = await Project.find({stream: stream})
                .populate({
                    path: "faculty_id",
                    select: {name: 1},
                    model: Faculty
                })
                .populate({
                    path: "student_alloted",
                    select: {name: 1, roll_no: 1, projects_preference: 1},
                    model: Student
                });
            const data = projects.map((val) => {
                let studentPreferences = [];
                if (val.student_alloted) {
                    for (const student of val.student_alloted) {
                        studentPreferences.push(student.projects_preference.indexOf(val._id) + 1);
                    }
                }
                return {
                    _id: val._id,
                    title: val.title,
                    faculty: val.faculty_id.name,
                    studentIntake: val.studentIntake,
                    student_alloted: val.student_alloted,
                    studentPreference: studentPreferences,
                    allotedCount: val.student_alloted.length
                };
            });
            generateCSVAllocation(data, stream);
            res.json({
                message: "success"
            });
        } else {
            res.json({
                message: "invalid-token"
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token"
        });
    }
});

router.get("/export_students/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            const programName = admin.stream;
            const promises = [];

            promises.push(
                Student.find({stream: programName})
                    .lean()
                    .populate({
                        path: "projects_preference",
                        select: "_id title",
                        model: Project
                    })
                    .then((students) => {
                        return students.map((val) => {
                            return {
                                _id: val._id,
                                name: val.name,
                                roll_no: val.roll_no,
                                gpa: val.gpa,
                                preferenceCount: val.projects_preference.length,
                                projects_preference: val.projects_preference
                            };
                        });
                    })
            );

            promises.push(
                Project.find({stream: programName})
                    .lean()
                    .then((data) => {
                        data.sort((a, b) => {
                            return a.students_id.length - b.students_id.length;
                        });
                        return data.map((val) => {
                            return {
                                _id: val._id,
                                title: val.title
                            };
                        });
                    })
            );

            let result = await Promise.all(promises);
            const students = result[0];
            const projects = result[1];
            const data = combineStudents(projects, students);
            generateCSVStudents(data, programName);
            res.json({
                message: "success"
            });
        } else {
            res.json({
                message: "invalid-token"
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token"
        });
    }
});

router.get("/download_csv/:id/:role", async (req, res) => {
    try {
        const id = req.params.id;
        const role = req.params.role;
        const idToken = req.headers.authorization;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean().select("stream");
            const filename = admin.stream;
            let file;
            if (role === "project") {
                file = path.resolve(__dirname, `../CSV/projects/${filename}.csv`);
            } else if (role === "student") {
                file = path.resolve(__dirname, `../CSV/students/${filename}.csv`);
            } else if (role === "allocation") {
                file = path.resolve(__dirname, `../CSV/allocation/${filename}.csv`);
            } else if (role === "format") {
                file = path.resolve(__dirname, `../CSV/format.csv`);
                if (!fs.existsSync(file)) {
                    fs.writeFileSync(file, "Name, Roll no., Gpa\n");
                }
            } else file = null;
            res.download(file);
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.get("/allocationStatus/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const allocationStatus = req.body.allocationMap;
        const result = [];
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id});
            let projects = await Project.find({stream: admin.stream})
                .populate({
                    path: "faculty_id",
                    select: "name",
                    model: Faculty
                })
                .populate({
                    path: "not_students_id",
                    select: {project_alloted: 1, name: 1, roll_no: 1},
                    model: Student
                })
                .populate({
                    path: "students_id",
                    select: {name: 1, roll_no: 1, project_alloted: 1},
                    model: Student,
                    populate: {
                        path: "project_alloted",
                        select: {title: 1, faculty_id: 1},
                        model: Project,
                        populate: {
                            path: "faculty_id",
                            select: {_id: 1, name: 1},
                            model: Faculty
                        }
                    }
                })
                .populate({
                    path: "student_alloted",
                    select: "name roll_no gpa",
                    model: Student
                });
            let students = await Student.find();
            let student_alloted;
            students = students.map((val) => {
                return {
                    _id: val._id,
                    name: val.name,
                    roll_no: val.roll_no
                };
            });
            for (const project of projects) {
                const pid = project._id.toString();
                const studentList = allocationStatus[pid];
                if (!allocationStatus[pid]) {
                    student_alloted = [];
                } else {
                    student_alloted = students.filter((val) => {
                        return studentList.indexOf(val._id.toString()) !== -1;
                    });
                }
                const newProj = {
                    _id: project._id,
                    title: project.title,
                    faculty_id: project.faculty_id._id,
                    description: project.description,
                    stream: project.stream,
                    duration: project.duration,
                    faculty: project.faculty_id.name,
                    studentIntake: project.studentIntake,
                    numberOfPreferences: project.students_id.length,
                    student_alloted: student_alloted,
                    students_id: project.students_id,
                    not_students_id: project.not_students_id,
                    isIncluded: project.isIncluded
                };
                result.push(newProj);
            }
            res.json({
                message: "success",
                result: result
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

router.get("/fetchAllMails/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let programAdmin = {};
        let stream;
        const promises = [];
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("_id programs isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id});
            for (const program of faculty.programs) {
                if (program.short === admin.stream) {
                    programAdmin = program;
                    stream = program.short;
                }
            }
            promises.push(
                Faculty.find({programs: {$elemMatch: programAdmin}})
                    .lean()
                    .select("email")
                    .then((faculty) => {
                        return faculty.map((val) => val.email);
                    })
            );
            promises.push(
                Student.find({stream: stream, isRegistered: true})
                    .lean()
                    .select("email")
                    .then((student) => {
                        return student.map((val) => val.email);
                    })
            );
            let result = await Promise.all(promises);
            const answer = [...result[0], ...result[1]];
            res.json({
                message: "success",
                result: answer,
                streamFull: programAdmin.full
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

router.post("/update_stage/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const stage = req.body.stage;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        let admin = await Admin.findOneAndUpdate({admin_id: faculty._id}, {stage: stage}, {new: true});
        if (admin.stage === 2) {
            await Admin.findByIdAndUpdate(admin._id, {reachedStage2: true});
            res.json({
                status: "success",
                msg: "Successfully moved to the next stage"
            });
        } else {
            res.json({
                status: "success",
                msg: "Successfully moved to the next stage"
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/setDeadline/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const date = req.body.deadline;
        const format_date = new Date(date);
        format_date.setHours(23, 59);
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        let admin = await Admin.findOne({admin_id: faculty._id});
        if (admin.deadlines.length === admin.stage + 1) {
            admin.deadlines.pop();
            admin.deadlines.push(format_date);
        }

        if (admin.stage === 0) {
            admin.startDate = new Date();
        }

        if (admin.stage === admin.deadlines.length)
            admin.deadlines.push(format_date);

        await admin.save();
        res.json({
            status: "success",
            msg: "Successfully set the deadline"
        });
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/set_projectCap/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const cap = req.body.cap;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        await Admin.findOneAndUpdate({admin_id: faculty._id}, {project_cap: cap});
        res.json({
            status: "success",
            msg: "Successfully updated the project cap"
        });
    } catch (e) {
        res.json({
            status: "fail",
            result: "faculty error"
        });
    }
});

router.post("/set_studentCap/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const studentCap = req.body.cap;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        await Admin.findOneAndUpdate({admin_id: faculty._id}, {student_cap: studentCap});
        res.json({
            status: "success",
            msg: "Successfully updated the student cap"
        });
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/set_studentsPerFacuty/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const cap = req.body.cap;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (faculty) {
            await Admin.findOneAndUpdate({admin_id: faculty._id}, {studentsPerFaculty: cap});
            res.json({
                status: "success",
                msg: "Successfully set the number of students per faculty!!"
            });
        } else {
            res.json({
                status: "fail",
                result: "Faculty not found"
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: "Authentication error"
        });
    }
});

router.post("/validateAllocation/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const selectedProjects = req.body.projects;
        const students = req.body.students;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}})
            .lean()
            .select("_id isAdmin");
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id}).lean();
            if (admin.stage >= 3) {
                let count_sum = 0;

                for (const project of selectedProjects) {
                    count_sum += Number(project.studentIntake);
                }

                if (count_sum >= Math.min(students, admin.studentCount)) {
                    res.json({
                        status: "success"
                    });
                } else {
                    res.json({
                        status: "fail"
                    });
                }
            } else {
                let projects = await Project.find({stream: admin.stream}).lean().select("studentIntake");
                let count = 0;

                for (const project of projects) {
                    count += project.studentIntake;
                }
                if (count >= Math.min(students, admin.studentCount)) {
                    res.json({
                        status: "success",
                        msg: "Allocation can start"
                    });
                } else {
                    res.json({
                        status: "fail",
                        result: null
                    });
                }
            }
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/revertStage/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const stage = req.body.stage;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty) {
            let admin = await Admin.findOne({admin_id: faculty._id});
            admin.deadlines.pop();
            admin.publishFaculty = false;
            admin.publishStudents = false;
            if (stage >= 3) {
                admin.stage = 2;
            } else {
                if (admin.stage === 1) {
                    admin.startDate = undefined;
                    admin.deadlines = [];
                }
                admin.stage = stage - 1;
            }
            await admin.save();
            if (stage >= 3) {
                await Project.updateMany({stream: admin.stream}, {student_alloted: []});
                await Student.updateMany({stream: admin.stream}, {$unset: {project_alloted: ""}});
            }
            res.json({
                status: "success",
                msg: "Successfully reverted back to the previous stage"
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/reset/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("isAdmin _id");
        if (faculty && faculty.isAdmin) {
            let adminUpdate = {
                $unset: {
                    startDate: ""
                },
                deadlines: [],
                publishFaculty: false,
                publishStudents: false,
                stage: 0,
                studentCount: 0,
                reachedStage2: false
            };
            let projectUpdate = {
                project_alloted: [],
                students_id: [],
                not_students_id: [],
                isIncluded: true,
                reorder: 0
            };
            const stream = faculty.adminProgram;
            let promises = [];
            promises.push(Admin.findOneAndUpdate({admin_id: faculty._id}, adminUpdate));
            promises.push(Student.deleteMany({stream: stream}));
            promises.push(Project.updateMany({stream: stream}, projectUpdate));
            await Promise.all(promises);
            res.json({
                message: "success",
                result: null
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

router.post("/uploadStudentList/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("_id")
        .then((faculty) => {
            if (faculty) {
                Admin.findOne({admin_id: faculty._id})
                    .then((admin) => {
                        if (admin) {
                            const file_path = path.resolve(__dirname, "../CSV/StudentList/");
                            if (!fs.existsSync(file_path)) {
                                fs.mkdirSync(file_path, {recursive: true});
                            }
                            const storage = multer.diskStorage({
                                destination: function (req, file, cb) {
                                    cb(null, file_path);
                                },

                                filename: function (req, file, cb) {
                                    cb(null, admin.stream + ".csv");
                                }
                            });
                            let upload = multer({storage: storage}).single("student_list");
                            upload(req, res, function (err) {
                                if (!req.file) {
                                    return res.send("Please select a file to upload");
                                } else if (err instanceof multer.MulterError) {
                                    return res.send(err);
                                } else if (err) {
                                    return res.send(err);
                                }
                                let fileRows = [];
                                csv
                                    .parseFile(req.file.path)
                                    .on("data", (data) => {
                                        fileRows.push([
                                            data[0].trim(),
                                            data[1].trim(),
                                            data[2].trim()
                                        ]);
                                    })
                                    .on("end", () => {
                                        const validationError = validateCsvData(fileRows);
                                        if (validationError) {
                                            fs.unlinkSync(req.file.path);
                                            return res.json({
                                                status: "fail_parse",
                                                msg: validationError
                                            });
                                        }

                                        const promises = [];

                                        for (let i = 1; i < fileRows.length; i++) {
                                            let data = fileRows[i];

                                            promises.push(
                                                Student.findOne({roll_no: data[1]}).then(
                                                    (student) => {
                                                        if (student) {
                                                            student.name = data[0];
                                                            student.gpa = data[2];

                                                            return student.save().then((result) => {
                                                                return result;
                                                            });
                                                        } else {
                                                            const newStudent = new Student({
                                                                name: data[0],
                                                                roll_no: data[1],
                                                                gpa: data[2],
                                                                stream: admin.stream,
                                                                email: data[1] + "@smail.iitpkd.ac.in"
                                                            });
                                                            return newStudent.save().then((result) => {
                                                                return result;
                                                            });
                                                        }
                                                    }
                                                )
                                            );
                                        }

                                        Promise.all(promises).then(() => {
                                            Student.find({stream: admin.stream}).select("_id").then(students => {
                                                admin.studentCount = students.length;
                                                admin.save().then(() => {
                                                    return res.json({
                                                        status: "success",
                                                        msg: "Successfully uploaded the student list."
                                                    });
                                                });
                                            });
                                        });
                                    });
                            });
                        } else {
                            res.json({
                                status: "fail",
                                result: null
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            status: "fail",
                            result: null
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: null
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null
            });
        });
});

router.post("/uploadStudentList/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({google_id: {id: id, idToken: idToken}})
        .lean()
        .select("_id")
        .then((faculty) => {
            if (faculty) {
                Admin.findOne({admin_id: faculty._id})
                    .then((admin) => {
                        if (admin) {
                            const file_path = path.resolve(__dirname, "../CSV/StudentList/");
                            if (!fs.existsSync(file_path)) {
                                fs.mkdirSync(file_path, {recursive: true});
                            }
                            const storage = multer.diskStorage({
                                destination: function (req, file, cb) {
                                    cb(null, file_path);
                                },

                                filename: function (req, file, cb) {
                                    cb(null, admin.stream + ".csv");
                                }
                            });
                            let upload = multer({storage: storage}).single("student_list");
                            upload(req, res, function (err) {
                                if (!req.file) {
                                    return res.send("Please select a file to upload");
                                } else if (err instanceof multer.MulterError) {
                                    return res.send(err);
                                } else if (err) {
                                    return res.send(err);
                                }
                                let fileRows = [];
                                csv
                                    .parseFile(req.file.path)
                                    .on("data", (data) => {
                                        fileRows.push([
                                            data[0].trim(),
                                            data[1].trim(),
                                            data[2].trim()
                                        ]);
                                    })
                                    .on("end", () => {
                                        const validationError = validateCsvData(fileRows);
                                        if (validationError) {
                                            fs.unlinkSync(req.file.path);
                                            return res.json({
                                                status: "fail_parse",
                                                msg: validationError
                                            });
                                        }

                                        const promises = [];

                                        for (let i = 1; i < fileRows.length; i++) {
                                            let data = fileRows[i];

                                            promises.push(
                                                Student.findOne({roll_no: data[1]}).then(
                                                    (student) => {
                                                        if (student) {
                                                            student.name = data[0];
                                                            student.gpa = data[2];

                                                            return student.save().then((result) => {
                                                                return result;
                                                            });
                                                        } else {
                                                            const newStudent = new Student({
                                                                name: data[0],
                                                                roll_no: data[1],
                                                                gpa: data[2],
                                                                stream: admin.stream,
                                                                email: data[1] + "@smail.iitpkd.ac.in"
                                                            });
                                                            return newStudent.save().then((result) => {
                                                                return result;
                                                            });
                                                        }
                                                    }
                                                )
                                            );
                                        }

                                        Promise.all(promises).then(() => {
                                            Student.find({stream: admin.stream}).select("_id").then(students => {
                                                admin.studentCount = students.length;
                                                admin.save().then(() => {
                                                    return res.json({
                                                        status: "success",
                                                        msg: "Successfully uploaded the student list."
                                                    });
                                                });
                                            });
                                        });
                                    });
                            });
                        } else {
                            res.json({
                                status: "fail",
                                result: null
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            status: "fail",
                            result: null
                        });
                    });
            } else {
                res.json({
                    status: "fail",
                    result: null
                });
            }
        })
        .catch(() => {
            res.json({
                status: "fail",
                result: null
            });
        });
});

router.post("/updatePublish/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const mode = req.body.mode;
        const allocationStatus = req.body.allocationMap;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty && faculty.isAdmin) {
            let admin = await Admin.findOne({admin_id: faculty._id});
            if (mode === "student") {
                admin.publishStudents = true;
            } else if (mode === "faculty") {
                admin.publishFaculty = true;
                admin.publishStudents = false;
            }
            await admin.save();
            const stream = admin.stream;
            if (!allocationStatus) {
                res.json({
                    status: "success",
                    message: null
                });
            } else if (mode !== "reset") {
                let projects = await Project.find({stream: stream});
                let promises = [];
                for (const project of projects) {
                    project.student_alloted = [];
                    promises.push(project.save());
                }
                await Promise.all(promises);
                promises = [];
                let students = await Student.find({stream: stream});
                for (const student of students) {
                    student.project_alloted = undefined;
                    promises.push(student.save());
                }
                await Promise.all(promises);
                for (const key in allocationStatus) {
                    if (allocationStatus.hasOwnProperty(key)) {
                        const studentsList = allocationStatus[key];
                        for (const student of studentsList) {
                            promises.push(Student.findByIdAndUpdate(mongoose.Types.ObjectId(student),
                                {project_alloted: mongoose.Types.ObjectId(key)}));
                        }
                    }
                }
                await Promise.all(promises);
                promises = [];
                for (const key in allocationStatus) {
                    if (allocationStatus.hasOwnProperty(key)) {
                        const studentsList = allocationStatus[key].map((val) => mongoose.Types.ObjectId(val));
                        promises.push(Project.findByIdAndUpdate(mongoose.Types.ObjectId(key),
                            {student_alloted: studentsList}));
                    }
                }
                await Promise.all(promises);
                Object.keys(allocationStatus).map(function (key) {
                    allocationStatus[key] = allocationStatus[key].map((val) => val.name);
                });
                projects = await Project.find({stream: stream})
                    .populate("faculty_id", null, Faculty)
                    .populate({
                        path: "students_id",
                        select: {name: 1, roll_no: 1},
                        model: Student
                    })
                    .populate({
                        path: "students_id",
                        select: {
                            name: 1,
                            roll_no: 1,
                            project_alloted: 1
                        },
                        model: Student,
                        populate: {
                            path: "project_alloted",
                            select: {title: 1, faculty_id: 1},
                            model: Project,
                            populate: {
                                path: "faculty_id",
                                select: {_id: 1, name: 1},
                                model: Faculty
                            }
                        }
                    })
                    .populate({
                        path: "student_alloted",
                        select: "name roll_no gpa",
                        model: Student
                    });
                const arr = [];
                for (const project of projects) {
                    const newProj = {
                        _id: project._id,
                        faculty_id: project.faculty_id._id,
                        title: project.title,
                        description: project.description,
                        stream: project.stream,
                        duration: project.duration,
                        faculty: project.faculty_id.name,
                        studentIntake: project.studentIntake,
                        numberOfPreferences:
                        project.students_id.length,
                        student_alloted: project.student_alloted,
                        students_id: project.students_id,
                        not_students_id: project.not_students_id,
                        isIncluded: project.isIncluded
                    };
                    arr.push(newProj);
                }
                res.json({
                    status: "success",
                    result: arr
                });
            } else {
                res.json({
                    status: "success",
                    message: null
                });
            }
        } else {
            res.json({
                status: "fail",
                msg: null
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            msg: null
        });
    }
});

router.post("/getPublish/:id", async (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    const mode = req.body.mode;
    if (mode === "student") {
        let student = await Student.findOne({google_id: {id: id, idToken: idToken}}).lean().select("stream");
        if (student) {
            let admin = await Admin.findOne({stream: student.stream}).lean();
            if (admin) {
                res.json({
                    status: "success",
                    studentPublish: admin.publishStudents,
                    facultyPublish: admin.publishFaculty
                });
            } else {
                res.json({
                    status: "fail",
                    result: null
                });
            }
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
        res.json({
            status: "fail",
            result: null
        });
    } else if (mode === "faculty") {
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty) {
            let programs = faculty.programs.map(val => val.short);
            let promises = [];
            let studentPublish = {};
            let facultyPublish = {};
            for (const program of programs) {
                promises.push(
                    Admin.findOne({stream: program}).then(admin => {
                        studentPublish[program] = admin.publishStudents;
                        facultyPublish[program] = admin.publishFaculty;
                        return admin;
                    })
                );
            }
            await Promise.all(promises);
            res.json({
                status: "success",
                studentPublish: studentPublish,
                facultyPublish: facultyPublish
            });
        } else {
            res.json({
                status: "fail",
                result: null
            });
        }
    } else {
        res.json({
            status: "fail",
            result: null
        });
    }
});

router.post("/updateLists/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        const stream = faculty.adminProgram;
        let students = await Student.find({stream: stream}).lean().select("_id gpa");
        students.sort((a, b) => {
            return b.gpa - a.gpa;
        });
        students = students.map(val => val._id);
        const updateCondition = [
            {
                $addFields: {
                    not_students_id: {$setDifference: [students, "$students_id"]}
                }
            }
        ];
        let projects = await Project.updateMany({stream: stream}, updateCondition);
        res.send(projects);
    } catch (e) {
        res.json({
            message: "fail",
            result: null
        });
    }
});

router.delete("/faculty/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const facultyID = req.headers.body;
        let programAdmin = {};

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty && faculty.isAdmin) {
            for (const program of faculty.programs) {
                if (program.short === faculty.adminProgram) {
                    programAdmin = program;
                }
            }
            let projects = await Project.find({
                stream: programAdmin.short,
                faculty_id: facultyID
            });
            const projectIDs = projects.map((val) => val._id);
            const updateCondition = {
                project_alloted: {$in: projectIDs}
            };
            let studRemovePrefs = {
                $pullAll: {projects_preference: projectIDs}
            };
            const studRemoveAllot = {
                $unset: {project_alloted: ""}
            };
            const updateFaculty = {
                $pullAll: {project_list: projectIDs},
                $pull: {programs: programAdmin}
            };
            let promises = [];
            promises.push(Project.deleteMany({stream: programAdmin.short, faculty_id: facultyID}));
            promises.push(Student.updateMany({stream: programAdmin.short}, studRemovePrefs));
            promises.push(Student.updateMany(updateCondition, studRemoveAllot));
            promises.push(Faculty.findByIdAndUpdate(facultyID, updateFaculty));
            await Promise.all(promises);
            res.json({
                message: "success",
                result: null
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

router.delete("/student/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const mid = req.headers.body;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (faculty && faculty.isAdmin) {
            let student = await Student.findByIdAndDelete(mid);
            const updateCondition = {
                $pullAll: {students_id: [mid], not_students_id: [mid], student_alloted: [mid]}
            };
            await Project.updateMany({stream: student.stream}, updateCondition);
            res.json({
                message: "success",
                result: null
            });
        } else {
            res.json({
                message: "invalid-token",
                result: null
            });
        }
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

module.exports = router;
