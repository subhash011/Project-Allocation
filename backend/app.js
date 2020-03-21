//imports
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
//use body-parser
app.use(bodyparser.json());
//start server
app.listen(8080, () => {
    console.log("up and running");
});
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