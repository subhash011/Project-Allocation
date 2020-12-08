const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    short: {
        type: String,
        required: true,
    },
    full: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Streams", Schema);
