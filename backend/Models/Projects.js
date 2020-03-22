const mongoose = require("mongoose");

mongoose.model("Projects", {
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    //we are yet to decide if we need the below fields
    teacherID: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true
    },
    studentID: [mongoose.SchemaTypes.ObjectId]
});