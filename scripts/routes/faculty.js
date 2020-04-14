const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");



router.post("/add/:num",(req,res)=>{

    const num = req.params.num;
    var promises = [];

    for (let index = 0; index < num; index++) {
        let names = "f" + (index + 1);

        const faculty = new Faculty({
            name: names
        })
       
        promises.push(
            faculty.save().then((result) => {
                return result;
            })
        );
    }

    Promise.all(promises)
        .then(result=>{
            res.json(result);
        })
});





module.exports = router;