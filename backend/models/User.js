const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    google_id: {
        type: String,
        required: true
    },
    isSuperAdimin: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", UserSchema);