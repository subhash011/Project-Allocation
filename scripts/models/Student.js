const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gpa: {
        type: Number,
        required: true,
    },
    projects_preference: {
        type: [mongoose.SchemaTypes.ObjectId],
    },
    project_alloted: {
        type: mongoose.SchemaTypes.ObjectId,
    },
});

module.exports = mongoose.model("Student", UserSchema);