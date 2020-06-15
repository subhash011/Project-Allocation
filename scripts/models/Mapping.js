const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    short: {
        type: String,
        required: true,
    },
    full: {
        type: String,
        required: true,
    },
    map: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("Mapping", Schema);