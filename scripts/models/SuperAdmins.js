const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    google_id: {
        id: {
            type: String
        },
        idToken: {
            type: String
        }
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("SuperAdmin", UserSchema);