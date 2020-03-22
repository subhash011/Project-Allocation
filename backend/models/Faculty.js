const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean
    },
    stream: {
        type: String,
        required: true
    },
<<<<<<< HEAD
    project_list: {
        type: []
    },
    student_preference: {
        type: []
=======
    project_list:{
        type:[mongoose.SchemaTypes.ObjectId]
    },
    student_preference:{
        type:[mongoose.SchemaTypes.ObjectId]
>>>>>>> c6c54aacb7461555ed7a7b589dd82626fc9dcefb
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Faculty", UserSchema);