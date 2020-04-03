const mongoose = require("mongoose");
const Faculty = require("./Faculty.js");

const UserSchema = new mongoose.Schema({
    stream: {
        type: String,
        required: true
    },
    admin_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: Faculty
    },
    stage: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("AdminInfo", UserSchema);