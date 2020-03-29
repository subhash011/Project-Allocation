//imports
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

const path = require("path");

const app = express();

//express session
app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: "woot",
    resave: false,
    saveUninitialized: false
  })
);
//use flash
app.use(flash());

//Using cors to enable request from thrid party api's
app.use(cors());

//use body-parser
app.use(bodyparser.json());
mongoose.set("useFindAndModify", false);

//connect to mongodb
mongoose
  .connect("mongodb://localhost:27017/ProjectAllocationTest", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(err => {
    console.log(err);
  });

//define all routes below this
const home = require("./routes/home");

app.use("/", home);

// const student = require("./routes/student");
// const faculty = require("./routes/faculty");
// app.use("/", home);
// const auth = require("./config/oauth");
// app.use("/auth", auth);
// app.use("/student", student);
// app.use("/faculty", faculty);

const auth_check = require("./routes/auth_check");
app.use("/auth", auth_check);

const student = require("./routes/student");
app.use("/student", student);

const faculty = require("./routes/faculty");
app.use("/faculty", faculty);
// const auth = require("./config/oauth");
// app.use("/auth", auth);
const student_project = require("./routes/student_project");
app.use("/student/project", student_project);

const faculty_project = require("./routes/faculty_project");
app.use("/faculty/project", faculty_project);

const PORT = process.env.PORT || 8080;

//Error Response for routes not registered
app.get("*", (req, res) => {
  res.status(404).json({
    error: "Page Not found"
  });
});

//start server
app.listen(PORT, () => {
  console.log("Server connected to port " + PORT);
});
