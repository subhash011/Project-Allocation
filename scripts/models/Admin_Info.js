const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    stream: {
        type: String,
        required: true,
    },
    deadlines: {
        type: [Date],
        default: [],
    },
    admin_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: Faculty,
    },
    stage: {
        type: Number,
        default: 0,
    },
    project_cap: {
        type: Number,
    },
    student_cap: {
        type: Number,
        default: 1,
    },
    studentsPerFaculty: {
        type: Number,
    },
    studentCount: {
        type: Number,
    },
    publishStudents: {
        type: Boolean,
        default: false
    },
    publishFaculty: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
    },
    maxStage: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Admin_Info", UserSchema);
