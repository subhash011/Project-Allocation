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
        required: true,
        ref: Faculty
    },
    stage: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Admin_Info", UserSchema);