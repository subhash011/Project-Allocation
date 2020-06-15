const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	google_id: {
		id: {
			type: String,
		},
		idToken: {
			type: String,
		},
	},
	isAdmin: {
		type: Boolean,
	},
	stream: {
		type: String,
		required: true,
	},
	project_list: {
		type: [mongoose.SchemaTypes.ObjectId],
	},
	programs: {
		type: [],
	},
	date: {
		type: Date,
		default: Date.now(),
	},
	adminProgram: {
		type: String,
	},
});

module.exports = mongoose.model("Faculty", UserSchema);
