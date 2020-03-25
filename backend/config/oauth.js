const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
    "101490425049-2t5koea5vs4lf1qu48nfnkn3rjsd304m.apps.googleusercontent.com"
);

module.exports = async token => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [
                "101490425049-2t5koea5vs4lf1qu48nfnkn3rjsd304m.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
                "1040090111157-llhk2n9egrpbv82tkijqm279q30s9mrk.apps.googleusercontent.com"
            ]
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return payload;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
};