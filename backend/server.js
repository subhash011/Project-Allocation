const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const compression = require("compression");
const moment = require("moment-timezone");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
require("dotenv/config");

// start the server
const session = require("express-session");
const MemoryStore = require('memorystore')(session)
const cors = require("cors");
const path = require("path");
const app = express();

const originalSend = app.response.send

app.response.send = function sendOverWrite(body) {
    originalSend.call(this, body)
    this.__custombody__ = body
}

let requestId = 1;
morgan.token('res-body', (_req, res) =>
    JSON.stringify(res.__custombody__),
)

morgan.token('date', (req, res, tz) => {
    return moment().tz('Asia/Kolkata').format('LTS');
})

morgan.token('id', (req, res, tz) => {
    return requestId++;
})

const errorLogStream = rfs.createStream('error.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs')
})

const responseLogStream = rfs.createStream('response.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs')
})

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs')
})

//express session
app.use(
    session({
        cookie: { maxAge: 60000, secure: true, sameSite: "none" },
        secret: "woot",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000
        }),
    })
);

app.use(cors());
app.use(compression());
//use body-parser
app.use(bodyparser.json({ limit: "50mb", extended: true }));

// log only 4xx and 5xx responses
app.use(morgan('[id] :method :url :status\n:res-body\n', {
    stream: errorLogStream,
    skip: function (req, res) { return res.statusCode < 400 }
}))

// log success responses
app.use(morgan('[:id] :method :url :status\n:res-body\n', {
    stream: responseLogStream,
    skip: function (req, res) { return res.statusCode >= 400 }
}))

// log all requests to access.log
app.use(morgan('[:id] :remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status', {
    stream: accessLogStream
}))


mongoose.set("useFindAndModify", false);

const { PORT = 8080, NODE_ENV = "DEV" } = process.env;

// uncomment during production
app.use(express.static(__dirname + "/build"));

const mongoConnect = process.env[`MONGO_URL_${NODE_ENV}`];
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

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

//start server
app.listen(PORT, () => {
    console.log("Server connected to port " + PORT);
});
