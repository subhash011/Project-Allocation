const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    name: {
        type: String,
        required: true,
    },
    roll_no: {
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
    email: {
        type: String,
        required: true,
    },
    gpa: {
        type: Number,
        required: true,
    },
    stream: {
        type: String,
        required: true,
    },
    projects_preference: {
        type: [mongoose.SchemaTypes.ObjectId],
    },
    project_alloted: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    isRegistered: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Student", UserSchema);
