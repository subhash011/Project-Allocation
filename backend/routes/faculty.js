const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const Mapping = require('../models/Mapping');

router.post("/register/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;

    const user = req.body;
    oauth(idToken).then(user_partial => {
        const newUser = new Faculty({
            name: user.name,
            google_id: {
                id: id,
                idToken: idToken
            },
            email: user.email,
            stream: user.stream,
            isAdmin: false
        });
        //Saves user in the database
        newUser
            .save()
            .then(result => {
                res.json({
                    registration: "success"
                });
            })
            .catch(err => {
                res.json({
                    registration: "fail"
                });
            });
    });
});

router.get("/details/:id", (req, res) => {
    const id = req.params.id;
    const idToken = req.headers.authorization;
    Faculty.findOne({ google_id: { id: id, idToken: idToken } })
        .then(user => {
            if (user) {
                res.json({
                    status: "success",
                    user_details: user
                });
            } else {
                res.json({
                    status: "fail",
                    user_details: ""
                });
            }
        })
        .catch(err => {
            res.json({
                status: "fail",
                user_details: err
            });
        });
});


router.post('/set_programs/:id',(req,res)=>{

    const id = req.params.id;
    const idToken = req.headers.authorization;
    const programs = req.body.programs;



    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{

            if(faculty){

                const streamMap = new Map(programs);

                const ex_programs = faculty.programs;

                if(ex_programs.length == 0 || ex_programs == null){

                    var new_programs = programs;

                }
                else{
                    
                    for(const program of ex_programs){

                        if(streamMap.has(program.short)){
                            streamMap.delete(program.short);
                        }
                    }

                }


                streamMap.forEach(function(value, key) {
                        const obj = {
                            full: value,
                            short:key
                        }
                        faculty.programs.push(obj);
                  })



                faculty.save()
                    .then(result=>{

                        res.json({
                            status:"success",
                            msg:"Successfully added the programs"
                        })


                    })
                    .catch(err=>{
                        res.json({
                            status:"fail",
                            result:null
                        })
                    })

              
            }

            else{
                res.json({
                    status:"fail",
                    result:null
                })
            }


        })
        .catch(err=>{
            res.json({
                status:"fail",
                result:null
            })
        })


});


router.post('/updateProfile/:id',(req,res)=>{

    const id = req.params.id;
    const idToken = req.headers.authorization;
    const name = req.body.name;

    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{

            if(faculty){

                faculty.name = name;

                faculty.save()
                    .then(result=>{

                        res.json({
                            status:"success",
                            msg:"Successfully updated the profile!!"
                        })

                    })
                    .catch(err=>{
                        res.json({
                            status:"fail",
                            result:null
                        })
                    })

            }
            else{

                res.json({
                    status:"fail",
                    result:null
                })


            }


        })
        .catch(err=>{
            res.json({
                status:"fail",
                result:null
            })
        })


})


router.post('/getAllPrograms/:id',(req,res)=>{


    const id = req.params.id;
    const idToken = req.headers.authorization;
    const stream = req.body.stream;


    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{

            if(faculty){

                Mapping.find()
                    .then(result=>{

                        if(result){

                            const allPrograms = result.filter(program=>{
                                if(program.short != stream){
                                    return program;
                                }
                            })

                            

                            res.json({
                                status:"success",
                                programs: allPrograms

                            })

                        }

                        else{

                            res.json({
                                status:"fail",
                                result:null
                            })

                        }

                    })
                    .catch(err=>{
                        res.json({
                            status:"fail",
                            result:null
                        })
                    })

            }

            else{

                res.json({
                    status:"fail",
                    result:null
                })

            }


        })
        .catch(err=>{
            res.json({
                status:"fail",
                result:null
            })
        })

})


router.post('/deleteProgram/:id',(req,res)=>{

    const id = req.params.id;
    const idToken = req.headers.authorization;
    const curr_program = req.body.program;

    console.log(curr_program);

    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{

            if(faculty){

                const new_programs = faculty.programs.filter(program=>{

                        if(program.full != curr_program.full){
                            return program
                        }
                    
                })                


                faculty.programs = new_programs;
                faculty.save()
                    .then(result=>{

                        res.json({
                            status:"success",
                            msg:"Successfully removed the program!!"
                        })


                    })
                    .catch(err=>{
                        res.json({
                            status:"fail",
                            result:null
                        })
                    })
            }


            else{

                res.json({
                    status:"fail",
                    result:null
                })

            }

        })
        .catch(err=>{
            res.json({
                status:"fail",
                result:null
            })
        })



})


router.get('/getFacultyPrograms/:id',(req,res)=>{

    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{


            if(faculty){
                const programs = faculty.programs;
                res.json({
                    status:"success",
                    programs: programs
                })

            }


            else{

                res.json({
                    status:"fail",
                    result:null
                })
                
            }


        })
        .catch(err=>{
            res.json({
                status:"fail",
                result:null
            })
        })

})



module.exports = router;