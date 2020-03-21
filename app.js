//imports for the project
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyparser = require('body-parser');
//body parser for json
app.use(bodyparser.json());
//start server
app.listen(8080, () => {
    console.log("Server started");
});
//connect to mongodb
mongoose
    .connect("mongodb://localhost:27017/ProjectAllocationTest", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("successfully connected to mongodb");
    })
    .catch(err => {
        console.log(err);
    });