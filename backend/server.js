//imports
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const fs = require("fs");
require("dotenv/config");

// start the server
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const app = express();

//express session
app.use(
    session({
        cookie: {maxAge: 60000, secure: true, sameSite: "none"},
        secret: "woot",
        resave: false,
        saveUninitialized: false
    })
);

app.use(cors());

//use body-parser
app.use(bodyparser.json({limit: "50mb", extended: true}));
mongoose.set("useFindAndModify", false);

//uncomment during production
// app.use(express.static(__dirname + "/btp-frontend"));

const mongoConnect = process.env.MONGO_URL_BACK;
//connect to mongodb
mongoose
    .connect(mongoConnect, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch((err) => {
        console.log(err);
    });

//define all routes below this
const home = require("./routes/home");
app.use("/api", home);

const auth_check = require("./routes/auth_check");
app.use("/api/auth", auth_check);

const student = require("./routes/student");
app.use("/api/student", student);

const faculty = require("./routes/faculty");
app.use("/api/faculty", faculty);

const student_project = require("./routes/student_project");
app.use("/api/student/project", student_project);

const faculty_project = require("./routes/faculty_project");
app.use("/api/faculty/project", faculty_project);

const super_admin = require("./routes/super_admin");
app.use("/api/super", super_admin);

const allocation = require("./routes/allocation");
app.use("/api/allocation", allocation);

const admin = require("./routes/admin");
app.use("/api/admin", admin);

const mail = require("./routes/email");
app.use("/api/email", mail);

const backup = require("./routes/backup");
app.use("/api/backup", backup);


const PORT = process.env.PORT || 8080;

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/btp-frontend/index.html"));
});

//start server
app.listen(PORT, () => {
    console.log("Server connected to port " + PORT);
});
