const express = require('express');
const mongoose = require('mongoose');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Project = require('../models/Project');

const router = express.Router()




router.get('/:id',(req,res)=>{

    const id = req.params.id;
    const idToken = req.headers.authorization;

    Faculty.findOne({google_id:{id:id,idToken:idToken}})
        .then(faculty=>{
            
            const stream = faculty.stream;

            Project.find({stream:stream})
                .then(projects=>{


                    projects.sort((a,b)=>{
                        return b.students_id.length - a.students_id.length;
                    });

                    const weights = [];
                    

                    for(const project of projects){
                        let promises = [];
                        const ids = project.students_id;
                        
                        for(const id of ids){
                            promises.push(
                                
                                Student.findOne({_id:id})
                                    .then(student=>{

                                        const weight = student.projects_preference.indexOf(id) + 1;
                                        return weight;

                                    })
                                    .catch(err=>{
                                        console.log(err)
                                    })
                            )
                        }

                        Promise.all(promises)
                            .then(result=>{
                                weights = result;
                                for(let i=0;i<weights.length;i++){
                                    weights[i] += i;
                                }
                                const alloted_ind = Math.min.apply(null,weights);

                                const alloted_id = ids[alloted_ind];

                                project.student_alloted = alloted_id;
                                
                                //Remove this id from all the project.students_id
                                for(let t_project of projects){


                                    t_project.students_id.filter((student_id)=>{

                                        if(student_id != alloted_id){
                                            return student_id;
                                        }

                                    })

                                }


                            })
                        







                    }


                })





        })
    


});








module.exports = router;










