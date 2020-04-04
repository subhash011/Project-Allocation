const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Scheduler = require("../models/Scheduler");
const axios = require("axios");
//this function sends the mail
//inputs are the mailing object and the transporter object
//we can pass these two from the post request

var branches = ["CSE", "EE", "ME", "CE"];

sendEmail = (mailOptions, transporter) =>
    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(error.stack || error);
                return reject(error);
            }
            resolve();
        });
    });

const text = "start over again";

router.post("/send", (req, res) => {
    const user = req.body.user;
    const to = req.body.to;
    const subject = req.body.subject;
    const mailBody = req.body.mailBody;
    const options = {
        to: to,
        subject: subject,
        text: mailBody,
    };
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: user.email,
            clientId: "1040090111157-llhk2n9egrpbv82tkijqm279q30s9mrk.apps.googleusercontent.com",
            clientSecret: "SMhGzWI6YS741l0Urs-a3yAH",
            accessToken: user.authToken,
        },
    });
    sendEmail(options, transport)
        .then((result) => {
            res.json({ message: "success" });
        })
        .catch((err) => {
            console.log(err);
            res.json({ message: "error", result: err });
        });
});

cron.schedule("*/2 * * * * *", function() {
    var schedule = [];
    var adminStreamWise = {};
    var deadlinesStreamWise = {};
    var stagesStreamWise = {};
    var studentEmail = {
        CSE: [],
        EE: [],
        ME: [],
        CE: [],
    };
    var facultyEmail = {
        CSE: [],
        EE: [],
        ME: [],
        CE: [],
    };
    Admin.find()
        .then((admins) => {
            for (const admin of admins) {
                adminStreamWise[admin.stream] = admin;
                deadlinesStreamWise[admin.stream] =
                    admin.deadlines[admin.deadlines.length - 1];
                stagesStreamWise[admin.stream] = admin.stage;
            }
            return adminStreamWise;
        })
        .then((admins) => {
            var now = new Date();
            for (const branch of branches) {
                if (
                    deadlinesStreamWise[branch] &&
                    (stagesStreamWise[branch] == 0 || stagesStreamWise[branch] == 2)
                ) {
                    if (
                        Math.abs(deadlinesStreamWise[branch].getTime() - now.getTime()) /
                        (1000 * 3600 * 24) <=
                        1
                    ) {
                        var schedulerFaculty = new Scheduler(
                            "faculty",
                            branch,
                            true,
                            stagesStreamWise[branch]
                        );
                        schedule.push(schedulerFaculty);
                    }
                } else if (
                    deadlinesStreamWise[branch] &&
                    stagesStreamWise[branch] == 1
                ) {
                    if (
                        Math.abs(deadlinesStreamWise[branch].getTime() - now.getTime()) /
                        (1000 * 3600 * 24) <=
                        1
                    ) {
                        var schedulerStudent = new Scheduler(
                            "faculty",
                            branch,
                            true,
                            stagesStreamWise[branch]
                        );
                        schedule.push(schedulerStudent);
                    }
                }
            }
            return schedule;
        })
        .then((schedules) => {
            var promises = [];
            var promisesStudent = [];
            for (const branch of branches) {
                promises.push(
                    Faculty.find({ stream: branch }).then((faculties) => {
                        facultyEmail[branch] = faculties.map((faculty) => faculty.email);
                        return branch;
                    })
                );
            }
            Promise.all(promises)
                .then((result) => {
                    return facultyEmail;
                })
                .then((faculties) => {
                    for (const branch of branches) {
                        promisesStudent.push(
                            Student.find({ stream: branch }).then((students) => {
                                studentEmail[branch] = students.map((student) => student.email);
                                return branch;
                            })
                        );
                    }
                    Promise.all(promisesStudent)
                        .then((result) => {
                            return studentEmail;
                        })
                        .then((students) => {
                            console.log(schedule);
                            //here i have the scheduler object which is enough to decide whom to mail
                            //once decided i have all the mail-id's required
                            //problem is that we have to get auth token to send mail
                        });
                });
        });
});

module.exports = router;