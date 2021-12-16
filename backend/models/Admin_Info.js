const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const UserSchema = new mongoose.Schema({
    stream: {
        type: String,
        required: true
    },
    deadlines: {
        type: [Date],
        default: []
    },
    admin_id: {
        type: mongoose.Types.ObjectId,
        default: null,
        ref: Faculty
    },
    stage: {
        type: Number,
        default: 0
    },
    project_cap: {
        type: Number,
        default: 0
    },
    student_cap: {
        type: Number,
        default: 0
    },
    studentsPerFaculty: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
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
        type: Date
    }
});

module.exports = mongoose.model("Admin_Info", UserSchema);
