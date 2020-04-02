const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
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
exports.sendEmail = mailOptions =>
    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
            if (error) {
                console.error(error.stack || error);
                return reject(error);
            }
            resolve();
        });
    });