const mongoose = require("mongoose");

mongoose.model("Students", {
    name: {
        type: String,
        require: true
    },
    rollno: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    cgpa: {
        type: Number,
        require: true
    },
    branch: {
        type: String,
        require: true
    },
    projectsChosen: [mongoose.SchemaTypes.ObjectId],
    projectAlloted: {
        type: mongoose.SchemaTypes.ObjectId
    }
});