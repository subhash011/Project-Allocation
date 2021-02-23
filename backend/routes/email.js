const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
require("dotenv/config");
//this function sends the mail
//inputs are the mailing object and the transporter object
//we can pass these two from the post request

sendEmail = (mailOptions, transporter) =>
	new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error) => {
			if (error) {
				return reject(error);
			}
			resolve();
		});
	});

const text = "start over again";

router.post("/send", (req, res) => {
	const to = req.body.to;
	const subject = req.body.subject;
	const mailBody = req.body.mailBody;
	const options = {
		bcc: to,
		subject: subject,
		text: mailBody,
		replyTo: "Do not reply to this email pap@smail.iitpkd.ac.in"
	};
	const transport = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.PAP_MAIL,
			pass: process.env.PAP_PASS,
		},
	});
	sendEmail(options, transport)
		.then((result) => {
			res.json({ message: "success" });
		})
		.catch((err) => {
			res.json({ message: "error", result: err });
		});
});

module.exports = router;
