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

app.use(cors());

//use body-parser
app.use(bodyparser.json());
mongoose.set("useFindAndModify", false);

var mongoConnect = process.env.MONGO_URL;

mongoose
    .connect(mongoConnect, {
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
const student = require("./routes/student");
app.use("/student", student);

const project = require("./routes/project");
app.use("/project", project);

const faculty = require("./routes/faculty");
app.use("/faculty", faculty);

const allocation = require("./routes/allocation");
app.use("/allocation", allocation);

const backup = require("./routes/backup");
app.use("/backup", backup);

const PORT = process.env.PORT || 8000;

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/btp-frontend/index.html"));
});

//start server
app.listen(PORT, () => {
    console.log("Server connected to port " + PORT);
});
