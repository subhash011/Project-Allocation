const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
require("dotenv/config");

sendEmail = (mailOptions, transporter) =>
    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });

router.post("/send", async (req, res) => {
    try {
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
                pass: process.env.PAP_PASS
            }
        });
        await sendEmail(options, transport);
        res.status(200).json({
            statusCode: 200,
            message: "Mails have been sent.",
            result: {
                sent: true
            }
        });
    } catch (e) {
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error! Please Sign-In again.",
            result: {
                sent: false,
                error: e
            }
        });
    }
});

module.exports = router;
