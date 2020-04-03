const mongoose = require("mongoose");
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
        required: true
    },
    stage: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date
    }
});

module.exports = mongoose.model("Admin_Info", UserSchema);