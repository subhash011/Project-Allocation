//imports
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

//Using cors to enable request from thrid party api's
app.use(cors());

//use body-parser
app.use(bodyparser.json());

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

//define all routes below this
const auth = require("./gmail/index");
const home = require("./routes/home");
const student = require("./routes/student");
app.use("/", home);
app.use("/auth", auth);
app.use("/student", student);

const PORT = process.env.PORT || 3000;

//Error Response for routes not registered
app.get("*", (req, res) => {
    res.status(404).json({
        error: "Page Not found"
    });
});

//start server
app.listen(3000, () => {
    console.log("connected to server");
});