const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("./Faculty.js");
const UserSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    studentIntake: {
        type: Number,
        required: true
    },
    stream: {
        type: String,
        required: true
    },
    faculty_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: Faculty,
        required: true
    },
    students_id: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: Student
    }
});

module.exports = mongoose.model("Project", UserSchema);