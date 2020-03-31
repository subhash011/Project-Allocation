const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    google_id: {
        id: {
            type: String,
            required: true
        },
        idToken: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("SuperAdmin", UserSchema);