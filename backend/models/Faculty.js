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
  google_id: {
    id: {
      type: String,
      required: true
    },
    idToken: {
      type: String,
      required: true
    }
  },
  isAdmin: {
    type: Boolean
  },
  stream: {
    type: String,
    required: true
  },
  project_list: {
    type: [mongoose.SchemaTypes.ObjectId]
  },
  student_preference: {
    type: [mongoose.SchemaTypes.ObjectId]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Faculty", UserSchema);
