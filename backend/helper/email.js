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
        accessToken: "ya29.a0Ae4lvC1-cce8_QnbRu9EG-2UQ53i_zLWaRTE91TCqEVc_OOfTjwb3emsdAKeJ42TtyExctbJNgkP0RzBAFxM2cdP65E8XmlxKUKM4T-ooxZBOh5C9PyVxsuGvKNt6cdj01itFuROTXfTQcFEx2zhRAdGg7BjgBL432E"
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