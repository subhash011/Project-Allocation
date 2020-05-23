const mongoose = require("mongoose");
const Student = require("./Student");
const Faculty = require("./Faculty");
const UserSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	duration: {
		type: String,
		required: true,
	},
	studentIntake: {
		type: Number,
		required: true,
	},
	stream: {
		type: String,
		required: true,
	},
	faculty_id: {
		type: mongoose.SchemaTypes.ObjectId,
		ref: Faculty,
		required: true,
	},
	students_id: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: Student,
	},
	student_alloted: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: Student,
	},
	isIncluded: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model("Project", UserSchema);
