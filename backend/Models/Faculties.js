const mongoose = require("mongoose");

mongoose.model("Faculties", {
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    branch: {
        type: String,
        require: true
    },
    projectList: [mongoose.SchemaTypes.ObjectId],
    prefOrder: [mongoose.SchemaTypes.ObjectId]
});