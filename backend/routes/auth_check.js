const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const SuperAdmin = require("../models/SuperAdmin");
const Project = require("../models/Project");
oauth = require("../config/oauth");

//add your email here if you want to be a super admin
const superAdmins = process.env.SUPER_ADMINS.split(",");

async function addStudentToNotOpted(result) {
    let updateResult = {
        $addToSet: {not_students_id: result._id}
    }
    let populator = {
        path: "not_students_id",
        select: "_id gpa",
        model: Student
    }
    try {
        await Project.updateMany({stream: result.stream}, updateResult);
        let projects = await Project.find({stream: result.stream}).populate(populator);
        let promises = []
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

router.post("/user_check", (req, res) => {
    const userDetails = req.body;

    oauth(userDetails.idToken)
        .then((user) => {
            const id = user["sub"];
            const email = userDetails.email.split("@");
            const email_check = email[1];

            if (superAdmins.includes(userDetails.email)) {
                SuperAdmin.findOne({email: userDetails.email}).then((user) => {
                    let role;
                    if (user) {
                        user.google_id.idToken = userDetails.idToken;
                        role = "super_admin";
                        user
                            .save()
                            .then(() => {
                                res.json({
                                    isRegistered: true,
                                    position: role,
                                    user_details: userDetails
                                });
                            })
                            .catch(() => {
                                res.json({
                                    isRegistered: true,
                                    position: "error",
                                    user_details: "SuperAdmin Not Saved - DB Error"
                                });
                            });
                    } else {
                        res.json({
                            isRegistered: false,
                            position: "super_admin",
                            user_details: userDetails
                        });
                    }
                });
            } else if (
                email_check === "iitpkd.ac.in" ||
                email_check === "gmail.com"
            ) {
                Faculty.findOne({email: userDetails.email})
                    .then((user) => {
                        if (user) {
                            user.google_id.idToken = userDetails.idToken;

                            let role = "";
                            if (user.isAdmin) {
                                role = "admin";
                            } else {
                                role = "faculty";
                            }

                            user
                                .save()
                                .then(() => {
                                    res.json({
                                        isRegistered: true,
                                        position: role,
                                        user_details: userDetails,
                                    });
                                })
                                .catch(() => {
                                    res.json({
                                        isRegistered: true,
                                        position: "error",
                                        user_details: "Faculty Not Saved - DB Error",
                                    });
                                });
                        } else {
                            res.json({
                                isRegistered: false,
                                position: "faculty",
                                user_details: userDetails,
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            isRegistered: false,
                            position: "error",
                            user_details: "Faculty Not Found",
                        });
                    });
            } else {
                let studentRegistered = true;
                Student.findOne({email: userDetails.email})
                    .then((user) => {
                        if (user) {
                            if (!user.isRegistered) {
                                user.google_id.idToken = userDetails.idToken;
                                user.google_id.id = id;
                                user.isRegistered = true;
                                studentRegistered = false;
                            } else {
                                user.google_id.idToken = userDetails.idToken;
                            }

                            user
                                .save()
                                .then((result) => {
                                    if (!studentRegistered) {
                                        addStudentToNotOpted(result).then(result => {
                                            if (result) {
                                                res.json({
                                                    isRegistered: true,
                                                    position: "student",
                                                    user_details: userDetails,
                                                });
                                            } else {
                                                res.json({
                                                    isRegistered: true,
                                                    position: "error",
                                                    user_details: "Student Not Saved - DB Error",
                                                });
                                            }
                                        })
                                    } else {
                                        res.json({
                                            isRegistered: true,
                                            position: "student",
                                            user_details: userDetails,
                                        });
                                    }
                                })
                                .catch(() => {
                                    res.json({
                                        isRegistered: true,
                                        position: "error",
                                        user_details: "Student Not Saved - DB Error",
                                    });
                                });
                        } else {
                            res.json({
                                isRegistered: false,
                                position: "student",
                                user_details: userDetails,
                                msg:
                                    "Your name was not in the list of students provided by the co-ordinator. Please contact your stream co-ordinator.",
                            });
                        }
                    })
                    .catch(() => {
                        res.json({
                            isRegistered: false,
                            position: "error",
                            user_details: userDetails,
                            msg: "Invalid google account",
                        });
                    });
            }
        })
        .catch(() => {
            res.json({
                isRegistered: false,
                position: "login-error",
                user_details: "Server Error",
            });
        });
});

router.get("/details/:id", (req, res) => {
    const idToken = req.headers.authorization;

    oauth(idToken)
        .then((user) => {
            const User = {
                name: user.name,
                email: user.email,
            };

            const email = user.email.split("@");
            if (superAdmins.includes(user.email)) {
                res.json({
                    position: "super_admin",
                    user_details: User,
                });
            } else if (email[1] === "smail.iitpkd.ac.in") {
                res.json({
                    position: "student",
                    user_details: User,
                });
            } else if (email[1] === "iitpkd.ac.in") {
                res.json({
                    position: "faculty",
                    user_details: User,
                });
            }
        })
        .catch((err) => {
            res.json({
                position: "error",
                user_details: err,
            });
        });
});

module.exports = router;
