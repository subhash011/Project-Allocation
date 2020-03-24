const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Faculty = require('../models/Faculty')


router.post('/register/:id',(req,res)=>{

    const id = req.params.id;
  const idToken = req.headers.authorization;

  const user = req.body;

  oauth(idToken)
    .then(user_partial=>{
        const newUser = new Student({

            name: user.name,
            google_id:{
                id: id,
                idToken: idToken
            },
            email:user.email,
            stream:user.stream
        })
        
        //Saves user in the database
        // newUser.save()
        //     .then((result)=>{ 
        //         res.json({
        //             registerd:'success'
        //         })
        //     })
        //     .catch(err=>{
        //         res.json({
        //             registered:'fail'
        //         })
        //     })
    })
    


})


router.get('/details/:id',(req,res)=>{

    const id = req.params;
//   console.log(id);
  const idToken = req.headers.authorization;

 Faculty.find({google_id:{id:id}})
    .then((user)=>{
        console.log('working')

        if(user.google_id.idToken === idToken ){

            res.json({
                status:'success',
                user_details:user
            })
        }
        else{

            res.json({
                status:'fail',
                user_details:"",
            })
        }

    })
    .catch(err=>{
        res.json({
            status:'fail',
            user_details:err
        })
    })

})






module.exports = router;
const app = express.Router();
// const mongoose = require("mongoose");
// const bodyparser = require("body-parser");
// const Faculty = require("../models/Faculty");

// app.get("/", (req, res) => {
//     res.send(req.body);
// });

// app.post("/register", (req, res) => {
//     var new_faculty = {
//         name: req.body.name,
//         email: req.body.email,
//         isAdmin: false,
//         stream: req.body.stream,
//         date: Date.now()
//     };

//     var faculty = new Faculty(new_faculty);
//     faculty
//         .save()
//         .then(() => {
//             res.json({ message: "faculty added successfully" });
//         })
//         .catch(err => {
//             if (err) {
//                 throw err;
//             }
//         });
// });

// module.exports = app;
