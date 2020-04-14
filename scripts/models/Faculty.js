const mongoose = require("mongoose");
const Project = require("./Project");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    project_list: {
        type: [mongoose.SchemaTypes.ObjectId],
    },
});

module.exports = mongoose.model("Faculty", UserSchema);