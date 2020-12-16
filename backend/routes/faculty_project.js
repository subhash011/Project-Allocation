const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");

router.post("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const program = req.body.program;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.status(404).json({
                statusCode: 404,
                message: "Faculty not found with the given details.",
                result: null
            });
            return;
        }
        let projects = await Project.find({faculty_id: faculty._id, stream: program}).lean();
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {projects}
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try again",
            result: null
        });
    }
});

router.post("/add/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const project_details = req.body;
        const program = project_details.program;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Session timed out! Please Sign-In again.",
                result: null
            });
            return;
        }
        const project = new Project({
            title: project_details.title,
            duration: project_details.duration,
            studentIntake: project_details.studentIntake,
            description: project_details.description,
            stream: project_details.program,
            faculty_id: faculty._id
        });
        let admin = await Admin.findOne({stream: program}).lean().select("project_cap student_cap studentsPerFaculty");
        if (!admin) {
            res.status(200).json({
                statusCode: 200,
                message: "You can only add projects if your program has an admin",
                result: {
                    updated: false
                }
            });
            return;
        }
        let projects = await Project.find({faculty_id: faculty._id, stream: program});
        const count = projects.length;
        let student_count = 0;

        for (const proj of projects) {
            student_count += proj.studentIntake;
        }

        if (admin.project_cap == null) {
            res.status(200).json({
                statusCode: 200,
                message: "Please contact the admin to set the project cap",
                result: {
                    updated: false
                }
            });
        } else if (count >= admin.project_cap) {
            res.status(200).json({
                statusCode: 200,
                message: `Max number of projects that can be added are ${admin.project_cap}`,
                result: {
                    updated: false
                }
            });
        } else {
            if (project_details.studentIntake > admin.student_cap) {
                res.status(200).json({
                    statusCode: 200,
                    message: `Max number of students that can be taken per project are ${admin.student_cap}`,
                    result: {
                        updated: false
                    }
                });
            } else if (
                student_count + Number(project_details.studentIntake) >
                admin.studentsPerFaculty
            ) {
                res.status(200).json({
                    statusCode: 200,
                    message: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`,
                    result: {
                        updated: false
                    }
                });
            } else {
                let students = await Student.find({stream: program}).sort([["gpa", -1]]).lean().select("_id");
                project.not_students_id = students.map(val => val._id);
                await project.save();
                faculty.project_list.push(project._id);
                await faculty.save();
                res.status(200).json({
                    statusCode: 200,
                    message: "Your project has been successfully added",
                    result: {
                        updated: true
                    }
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

router.post("/applied/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const project_id = req.body.project;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Faculty not found with the given details.",
                result: null
            });
            return;
        }
        let studentPop = {
            path: "students_id",
            select: "-google_id -stream -date -email -isRegistered",
            model: Student
        };
        let notStudentPop = {
            path: "not_students_id",
            select: "-google_id -stream -date -email -isRegistered",
            model: Student
        };
        let project = await Project.findById(mongoose.Types.ObjectId(project_id)).populate(studentPop).populate(notStudentPop);
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                students: project["students_id"],
                reorder: project["reorder"],
                non_students: project["not_students_id"]
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again",
            result: null
        });
    }
});

router.post("/include_projects/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let projects = req.body.projects.map((val) => mongoose.Types.ObjectId(val));
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Faculty not found with the give details.",
                result: null
            });
            return;
        }
        const faculty_id = faculty._id;
        let conditions = {
            faculty_id: faculty_id
        };
        await Project.updateMany(conditions, {isIncluded: false});
        conditions = {
            _id: {$in: projects},
            faculty_id: faculty_id
        };
        await Project.updateMany(conditions, {isIncluded: true});
        res.status(200).json({
            statusCode: 200,
            message: "success",
            result: {
                updated: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

router.post("/save_preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const students = req.body.student;
        const project_id = req.body.project_id;
        const idToken = req.headers.authorization;
        const stream = req.body.stream;
        const index = req.body.index;
        let reorder = req.body.reorder;
        let admin = await Admin.findOne({stream: stream}).lean().select("stage");
        if (admin.stage === 2) {
            let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
            if (!faculty) {
                res.status(401).json({
                    statusCode: 401,
                    message: "Faculty not found with the given details.",
                    result: null
                });
                return;
            }
            if (index === 0) {
                if (reorder === 0) reorder = -1;
                else if (reorder === 1) reorder = 2;
                await Project.findByIdAndUpdate(project_id, {students_id: students, reorder: reorder});
                res.status(200).json({
                    statusCode: 200,
                    message: "Your preferences are saved",
                    result: {reorder, updated: true}
                });
            } else if (index === 1) {
                if (reorder === 0) reorder = 1;
                else if (reorder === -1) reorder = 2;
                await Project.findByIdAndUpdate(project_id, {not_students_id: students, reorder: reorder});
                res.status(200).json({
                    statusCode: 200,
                    message: "Your preferences are saved",
                    result: {reorder, updated: true}
                });
            }
        } else {
            res.status(200).json({
                statusCode: 200,
                message: "You cannot edit preferences anymore.",
                result: {reorder, updated: false}
            });
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Session timed out! Please Sign-In again.",
            result: null
        });
    }
});

router.post("/update/:id", async (req, res) => {

    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.status(404).json({
                statusCode: 404,
                message: "Faculty not found with the given details.",
                result: null
            });
            return;
        }
        let project = req.body.project;
        const project_id = mongoose.Types.ObjectId(project.project_id);
        const title = project.title;
        const duration = Number(project.duration);
        const studentIntake = Number(project.studentIntake);
        const description = project.description;
        project = await Project.findById({_id: project_id});
        project.title = title;
        project.duration = duration;
        project.studentIntake = studentIntake;
        project.description = description;
        const stream = project.stream;
        let admin = await Admin.findOne({stream: stream})
                               .select({
                                   student_cap: 1,
                                   studentsPerFaculty: 1
                               });
        if (!admin) {
            res.status(200).json({
                statusCode: 200,
                message: "You can only update projects if your program has an admin",
                result: {
                    updated: false
                }
            });
            return;
        }
        let projects = await Project.find({faculty_id: project.faculty_id, stream: stream});
        let student_count = 0;
        for (const proj of projects) {
            if (proj._id.toString() === project_id.toString()) {
                student_count += studentIntake;
            } else {
                student_count += proj.studentIntake;
            }
        }
        if (project.studentIntake > admin.student_cap) {
            res.status(200).json({
                statusCode: 200,
                message: `Max number of students that can be taken per project are ${admin.student_cap}`,
                result: {
                    updated: false
                }
            });
        } else if (student_count > admin.studentsPerFaculty) {
            res.status(200).json({
                statusCode: 200,
                message: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`,
                result: {
                    updated: false
                }
            });
        } else {
            await project.save();
            res.status(200).json({
                statusCode: 200,
                message: `Project successfully updated`,
                result: {
                    updated: true
                }
            });
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: `Internal Server Error! Please try again`,
            result: {
                updated: false
            }
        });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const projectId = req.headers.body;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (!faculty) {
            res.status(401).json({
                statusCode: 401,
                message: "Faculty not found with the given details.",
                result: null
            });
            return;
        }
        let project = await Project.findByIdAndRemove({_id: projectId});
        let students_id = project.students_id;
        let faculty_id = project.faculty_id;
        let facUpdate = {
            $pull: {project_list: projectId}
        };
        let studUpdate = {
            $pull: {projects_preference: projectId}
        };
        let promises = [];
        promises.push(Faculty.findByIdAndUpdate(faculty_id, facUpdate));
        promises.push(Student.updateMany({_id: {$in: students_id}}, studUpdate));
        await Promise.all(promises);
        res.status(200).json({
            statusCode: 200,
            message: "Successfully removed the project.",
            result: {
                deleted: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please try-again.",
            result: null
        });
    }
});

// TODO check if this route is used
// router.post("/notApplied/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const idToken = req.headers.authorization;
//         const project_id = req.body.project;
//
//         let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
//         if (!faculty) {
//             res.json({
//                 status: "fail",
//                 result: null
//             });
//             return;
//         }
//         let project = await Project.findById(mongoose.Types.ObjectId(project_id))
//                                    .lean()
//                                    .populate({
//                                        path: "not_students_id",
//                                        select: "-google_id -email -isRegistered -date",
//                                        model: Student
//                                    });
//         if (project) {
//             res.json({
//                 status: "success",
//                 non_students: project["not_students_id"]
//             });
//
//         } else {
//             res.json({
//                 status: "fail",
//                 result: null
//             });
//         }
//     } catch (e) {
//         res.json({
//             status: "fail",
//             result: null
//         });
//     }
// });

module.exports = router;
