//imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
<<<<<<< HEAD
const flash = require("connect-flash");
=======
const cors = require('cors')

const app = express();

//Using cors to enable request from thrid party api's
app.use(cors());

>>>>>>> vamsi
//use body-parser
app.use(bodyparser.json());

//connect to mongodb
mongoose
<<<<<<< HEAD
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
const auth = require("./gmail/index");
const home = require("./routes/home");
app.use("/", home);
app.use("/auth", auth);
=======
  .connect("mongodb://localhost:27017/ProjectAllocationTest", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to mongodb");
  })
  .catch(err => {
    console.log(err);
  });

const PORT = process.env.PORT || 3000;

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
>>>>>>> vamsi
