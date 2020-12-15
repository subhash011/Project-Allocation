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
        const stream = req.body.stream;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.json({
                status: "fail",
                project_details: "Not valid faculty id",
                students: "Error"
            });
            return;
        }
        try {
            let projects = await Project.find({faculty_id: faculty._id, stream: stream}).lean();
            if (projects) {
                res.json({
                    status: "success",
                    project_details: projects
                });
            } else {
                res.json({
                    stauts: "fail",
                    project_details: "Error",
                    students: "Error"
                });
            }
        } catch (e) {
            res.json({
                stauts: "fail",
                project_details: "Project Not Found",
                students: "Error"
            });
        }
    } catch (e) {
        res.json({
            stauts: "fail",
            project_details: "Faculty Not Found",
            students: "Error"
        });
    }
});

router.post("/add/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const project_details = req.body;
        const stream = project_details.stream;
        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}});
        if (!faculty) {
            res.json({
                save: "fail",
                msg: "User not found"
            });
            return;
        }
        const project = new Project({
            title: project_details.title,
            duration: project_details.duration,
            studentIntake: project_details.studentIntake,
            description: project_details.description,
            stream: project_details.stream,
            faculty_id: faculty._id
        });
        let admin = await Admin.findOne({stream: stream}).lean().select("project_cap student_cap studentsPerFaculty");
        if (!admin) {
            res.json({
                status: "fail",
                result: null
            });
            return;
        }
        let projects = await Project.find({faculty_id: faculty._id, stream: stream});
        const count = projects.length;
        let student_count = 0;

        for (const proj of projects) {
            student_count += proj.studentIntake;
        }

        if (admin.project_cap == null) {
            res.json({
                save: "projectCap",
                msg: "Please contact the admin to set the project cap"
            });
        } else if (count >= admin.project_cap) {
            res.json({
                save: "projectCap",
                msg: `Max number of projects that can be added are ${admin.project_cap}`
            });
        } else {
            if (project_details.studentIntake > admin.student_cap) {
                res.json({
                    save: "studentCap",
                    msg: `Max number of students that can be taken per project are ${admin.student_cap}`
                });
            } else if (
                student_count + Number(project_details.studentIntake) >
                admin.studentsPerFaculty
            ) {
                res.json({
                    save: "studentsPerFaculty",
                    msg: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`
                });
            } else {
                let students = await Student.find({stream: stream}).sort([['gpa', -1]]).lean().select("_id");
                project.not_students_id = students.map(val => val._id);
                await project.save();
                faculty.project_list.push(project._id);
                await faculty.save();
                res.json({
                    save: "success",
                    msg: "Your project has been successfully added"
                });
            }
        }
    } catch (e) {
        res.json({
            save: "fail",
            msg: " There was an error, Please try again!"
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
            res.json({
                status: "fail",
                students: "Server Error"
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
        res.json({
            status: "success",
            students: project["students_id"],
            reorder: project["reorder"],
            non_students: project["not_students_id"]
        });
    } catch (e) {
        res.json({
            status: "fail",
            students: "Authentication Error"
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
            res.json({
                message: "invalid-token",
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
        res.json({
            message: "success",
            result: null
        });
    } catch (e) {
        res.json({
            message: "invalid-token",
            result: null
        });
    }
});

router.post("/save_preference/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const student_ids = req.body.student;
        const project_id = req.body.project_id;
        const idToken = req.headers.authorization;
        const stream = req.body.stream;
        const index = req.body.index;
        let reorder = req.body.reorder;
        let admin = await Admin.findOne({stream: stream}).lean().select("stage");
        if (admin.stage === 2) {
            let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
            if (faculty) {
                if (index === 0) {

                    if (reorder === 0) reorder = -1;
                    else if (reorder === 1) reorder = 2;

                    await Project.findByIdAndUpdate(project_id, {students_id: student_ids, reorder: reorder});
                    res.json({
                        status: "success",
                        msg: "Your preferences are saved",
                        reorder: reorder
                    });
                } else if (index === 1) {

                    if (reorder === 0) reorder = 1;
                    else if (reorder === -1) reorder = 2;

                    await Project.findByIdAndUpdate(project_id, {not_students_id: student_ids, reorder: reorder});
                    res.json({
                        status: "success",
                        msg: "Your preferences are saved",
                        reorder: reorder
                    });
                }

            } else {
                res.json({
                    status: "fail",
                    msg: "Invalid Login"
                });
            }
        } else {
            res.json({
                status: "fail",
                msg: "You cannot edit preferences anymore."
            });
        }
    } catch (e) {
        res.json({
            status: "fail",
            msg: "Some error occurred!!! Please Reload"
        });
    }
});

router.post("/update/:id", async (req, res) => {

    try {
        const project_id = mongoose.Types.ObjectId(req.params.id);
        const title = req.body.title;
        const duration = Number(req.body.duration);
        const studentIntake = Number(req.body.studentIntake);
        const description = req.body.description;
        let project = await Project.findById({_id: project_id});
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
            res.json({
                status: "fail",
                msg: "Admin Not Found"
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
            res.json({
                status: "fail1",
                msg: `Max number of students that can be taken per project are ${admin.student_cap}`
            });
        } else if (student_count > admin.studentsPerFaculty) {
            res.json({
                status: "fail2",
                msg: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`
            });
        } else {
            try {
                await project.save();
                res.json({
                    status: "success",
                    msg: "Your Project was successfully updated"
                });
            } catch (e) {
                res.json({
                    status: "fail",
                    msg: "Project Not Saved. Please reload and try again!!!"
                });
            }
        }
    } catch (e) {
        res.json({
            status: "fail",
            msg: "Project Not Found"
        });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        let project = await Project.findByIdAndRemove({_id: id});
        let students_id = project.students_id;
        let faculty_id = project.faculty_id;
        let facUpdate = {
            $pull: {project_list: id}
        };
        let studUpdate = {
            $pull: {projects_preference: id}
        };
        let promises = [];
        promises.push(Faculty.findByIdAndUpdate(faculty_id, facUpdate));
        promises.push(Student.updateMany({_id: {$in: students_id}}, studUpdate));
        await Promise.all(promises);
        res.json({
            status: "success",
            msg: "The project has been successfully deleted"
        });
    } catch (e) {
        res.json({
            status: "fail",
            msg: "Please reload and try again!!!"
        });
    }
});

router.post("/notApplied/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const idToken = req.headers.authorization;
        const project_id = req.body.project;

        let faculty = await Faculty.findOne({google_id: {id: id, idToken: idToken}}).lean().select("_id");
        if (!faculty) {
            res.json({
                status: "fail",
                result: null
            });
            return;
        }
        let project = await Project.findById(mongoose.Types.ObjectId(project_id))
            .lean()
            .populate({
                path: "not_students_id",
                select: "-google_id -email -isRegistered -date",
                model: Student
            });
        if (project) {
            res.json({
                status: "success",
                non_students: project["not_students_id"]
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

module.exports = router;
