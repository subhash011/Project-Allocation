const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const SuperAdmin = require("../models/SuperAdmin");
const Project = require("../models/Project");
oauth = require("../config/oauth");

//add your email here if you want to be a super admin
const superAdmins = process.env.SUPER_ADMINS.split(",");

// add this student to non-opted list in all projects
async function addStudentToNotOpted(result) {
    let updateResult = {
        $addToSet: {not_students_id: result._id}
    };
    let populator = {
        path: "not_students_id",
        select: "_id gpa",
        model: Student
    };
    try {
        await Project.updateMany({stream: result.stream}, updateResult);
        let projects = await Project.find({stream: result.stream}).populate(populator);
        let promises = [];
        for (const project of projects) {
            project.not_students_id.sort((a, b) => b.gpa - a.gpa);
            promises.push(project.save());
        }
        await Promise.all(promises);
        return true;
    } catch (err) {
        return false;
    }
}

router.post("/user_check", async (req, res) => {
    try {
        const userDetails = req.body;
        let user = await oauth(userDetails.idToken);
        const id = user["sub"];
        const email = userDetails.email.split("@");
        const email_check = email[1];
        if (superAdmins.includes(userDetails.email)) {
            let superAdmin = await SuperAdmin.findOne({email: userDetails.email});
            if (!superAdmin) {
                res.json({
                    isRegistered: false,
                    position: "super_admin",
                    user_details: userDetails
                });
                return;
            }
            superAdmin.google_id.idToken = userDetails.idToken;
            let role = "super_admin";
            try {
                await superAdmin.save();
                res.json({
                    isRegistered: true,
                    position: role,
                    user_details: userDetails
                });
            } catch (e) {
                res.json({
                    isRegistered: true,
                    position: "error",
                    user_details: "SuperAdmin Not Saved - DB Error"
                });
            }
        } else if (
            email_check === "iitpkd.ac.in" ||
            email_check === "gmail.com"
        ) {
            try {
                let faculty = await Faculty.findOne({email: userDetails.email});
                if (!faculty) {
                    res.json({
                        isRegistered: false,
                        position: "faculty",
                        user_details: userDetails
                    });
                    return;
                }
                faculty.google_id.idToken = userDetails.idToken;

                let role = "";
                if (faculty.isAdmin) {
                    role = "admin";
                } else {
                    role = "faculty";
                }

                try {
                    await faculty.save();
                    res.json({
                        isRegistered: true,
                        position: role,
                        user_details: userDetails
                    });
                } catch (e) {
                    res.json({
                        isRegistered: true,
                        position: "error",
                        user_details: "Faculty Not Saved - DB Error"
                    });
                }
            } catch (e) {
                res.json({
                    isRegistered: false,
                    position: "error",
                    user_details: "Faculty Not Found"
                });
            }
        } else {
            try {
                let studentRegistered = true;
                let student = await Student.findOne({email: userDetails.email});
                if (!student) {
                    res.json({
                        isRegistered: false,
                        position: "student",
                        user_details: userDetails,
                        msg:
                            "Your name was not in the list of students provided by the co-ordinator. Please contact your stream co-ordinator."
                    });
                    return;
                }
                if (!student.isRegistered) {
                    student.google_id.idToken = userDetails.idToken;
                    student.google_id.id = id;
                    student.isRegistered = true;
                    studentRegistered = false;
                } else {
                    student.google_id.idToken = userDetails.idToken;
                }
                student = await student.save();
                if (!studentRegistered) {
                    let result = await addStudentToNotOpted(student);
                    if (result) {
                        res.json({
                            isRegistered: true,
                            position: "student",
                            user_details: userDetails
                        });
                    } else {
                        res.json({
                            isRegistered: true,
                            position: "error",
                            user_details: "Student Not Saved - DB Error"
                        });
                    }
                } else {
                    res.json({
                        isRegistered: true,
                        position: "student",
                        user_details: userDetails
                    });
                }
            } catch (e) {
                res.json({
                    isRegistered: true,
                    position: "error",
                    user_details: "Student Not Saved - DB Error"
                });
            }
        }
    } catch (e) {
        console.log(e);
        res.json({
            isRegistered: false,
            position: "login-error",
            user_details: "Server Error"
        });
    }
});

router.get("/details/:id", async (req, res) => {
    try {
        const idToken = req.headers.authorization;
        let user = await oauth(idToken);
        const User = {
            name: user.name,
            email: user.email
        };
        const email = user.email.split("@");
        if (superAdmins.includes(user.email)) {
            res.json({
                position: "super_admin",
                user_details: User
            });
        } else if (email[1] === "smail.iitpkd.ac.in") {
            res.json({
                position: "student",
                user_details: User
            });
        } else if (email[1] === "iitpkd.ac.in") {
            res.json({
                position: "faculty",
                user_details: User
            });
        }
    } catch (e) {
        res.json({
            position: "error",
            user_details: e
        });
    }
});

module.exports = router;
