// const emailHelpers = require("./email");
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyparser.json());
const tesr = "trying newly";
const options = {
    to: ["111801042@smail.iitpkd.ac.in", "subhash011011@gmail.com"],
    subject: "Test",
    text: tesr
};

var trans = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: "subhash011011@gmail.com",
        clientId: "1040090111157-llhk2n9egrpbv82tkijqm279q30s9mrk.apps.googleusercontent.com",
        clientSecret: "SMhGzWI6YS741l0Urs-a3yAH",
        accessToken: "ya29.a0Ae4lvC2uoygsDXiGkGndAZDxJyIloZVTxYE09ykRz3b5CJTqEar3j5bDKlAd62sztle4dIwwuixe-mm6Cok9_Dp6ClKXGRQ0YQQkpJumiPfkB8CHGM_OLQi4Xxqcrd7NI252PA-vMJpQRLP-CKROED6eopB0Pb49pgIj"
    }
});

app.listen("8000", () => {
    console.log("listening");
});

app.post("/send", (req, res) => {
    sendEmail(options, trans)
        .then(result => {
            res.json("success");
        })
        .catch(err => {
            console.log(err);
        });
});

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