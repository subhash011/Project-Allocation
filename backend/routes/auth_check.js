const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const SuperAdmin = require("../models/SuperAdmin");
const Project = require("../models/Project");
const oauth = require("../config/oauth");

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
                res.status(200).json({
                    statusCode: 200,
                    message: "success",
                    result: {
                        registered: false,
                        position: "super_admin",
                        user_details: userDetails
                    }
                });
                return;
            }
            superAdmin.google_id.idToken = userDetails.idToken;
            await superAdmin.save();
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    registered: true,
                    position: "super_admin",
                    user_details: userDetails
                }
            });
        } else if (
            email_check === "iitpkd.ac.in" ||
            email_check === "gmail.com"
        ) {
            let faculty = await Faculty.findOne({email: userDetails.email});
            if (!faculty) {
                res.status(200).json({
                    statusCode: 200,
                    message: "success",
                    result: {
                        registered: false,
                        position: "faculty",
                        user_details: userDetails
                    }
                });
                return;
            }
            faculty.google_id.idToken = userDetails.idToken;
            let role;
            if (faculty.isAdmin) {
                role = "admin";
            } else {
                role = "faculty";
            }
            await faculty.save();
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    registered: true,
                    position: role,
                    user_details: userDetails
                }
            });
        } else {
            let studentRegistered = true;
            let student = await Student.findOne({email: userDetails.email});
            if (!student) {
                res.status(200).json({
                    statusCode: 200,
                    message: "Your name was not in the list of students provided by the co-ordinator. Please contact your program co-ordinator.",
                    result: {
                        registered: false,
                        position: "student",
                        user_details: userDetails
                    }
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
            if (studentRegistered) {
                res.status(200).json({
                    statusCode: 200,
                    message: "success",
                    result: {
                        registered: true,
                        position: "student",
                        user_details: userDetails
                    }
                });
                return;
            }
            let result = await addStudentToNotOpted(student);
            if (!result) {
                res.status(200).json({
                    statusCode: 200,
                    message: "There was an issue while setting up your data. Please let your program co-ordinator know about this.",
                    result: {
                        registered: false,
                        position: "student",
                        user_details: userDetails
                    }
                });
                return;
            }
            res.status(200).json({
                statusCode: 200,
                message: "success",
                result: {
                    registered: true,
                    position: "student",
                    user_details: userDetails
                }
            });
        }
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "User not registered. There was some error, please try again.",
            result: null
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
