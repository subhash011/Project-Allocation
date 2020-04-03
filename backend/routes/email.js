const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
//this function sends the mail
//inputs are the mailing object and the transporter object
//we can pass these two from the post request
sendEmail = (mailOptions, transporter) =>
    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
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
        text: mailBody
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
            accessToken: user.authToken
        }
    });
    sendEmail(options, transport)
        .then(result => {
            res.json({ message: "success" });
        })
        .catch(err => {
            console.log(err);
            res.json({ message: "error", result: err });
        });
});

module.exports = router;