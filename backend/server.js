//imports
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
require("dotenv/config");

// start the server
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const app = express();

//express session
app.use(
    session({
        cookie: { maxAge: 60000 },
        secret: "woot",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(cors());

//use body-parser
app.use(bodyparser.json());
mongoose.set("useFindAndModify", false);

//uncomment during production
// app.use(express.static(__dirname + "/btp-frontend"));
// var mongoConnect = process.env.MONGO_URL;
//connect to mongodb
mongoose
.connect("mongodb://localhost:27017/ProjectAllocationTest", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch((err) => {
        console.log(err);
    });

//define all routes below this
const home = require("./routes/home");
app.use("", home);

const auth_check = require("./routes/auth_check");
app.use("/auth", auth_check);

const student = require("./routes/student");
app.use("/student", student);

const faculty = require("./routes/faculty");
app.use("/faculty", faculty);

const student_project = require("./routes/student_project");
app.use("/student/project", student_project);

const faculty_project = require("./routes/faculty_project");
app.use("/faculty/project", faculty_project);

const super_admin = require("./routes/super_admin");
app.use("/super", super_admin);

const allocation = require("./routes/allocation");
app.use("/allocate", allocation);

const admin = require("./routes/admin");
app.use("/admin", admin);

const mail = require("./routes/email");
app.use("/email", mail);

const PORT = process.env.PORT || 8080;

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/btp-frontend/index.html"));
});

//start server
app.listen(PORT, () => {
    console.log("Server connected to port " + PORT);
});