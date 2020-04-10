const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

module.exports = async(token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [
            // Specify the CLIENT_ID of the app that accesses the backend
            process.env.GOOGLE_CLIENT_ID,
        ],
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return payload;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
};