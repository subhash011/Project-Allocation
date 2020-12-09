const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    short: {
        type: String,
        required: true,
    },
    full: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Programs", Schema);
