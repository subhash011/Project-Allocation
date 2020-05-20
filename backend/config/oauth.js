require("dotenv/config");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET
);

module.exports = async (token) => {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: [process.env.GOOGLE_CLIENT_ID],
	});
	const payload = ticket.getPayload();
	return payload;
	// If request specified a G Suite domain:
	//const domain = payload['hd'];
};
