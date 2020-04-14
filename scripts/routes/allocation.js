const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

router.post("/start", (req, res) => {
  // const stream = faculty[0].stream;
  var projects = [];
  var students = [];
  var alloted = [];
  var free = [];
  //this allocation status is the map which is the answer
  var allocationStatus = new Map();
  var promises = [];
  promises.push(
    Project.find().then((projectList) => {
        
        projects = projectList;
      projects.sort((b, a) => {
        return a.students_id.length - b.students_id.length;
      });
      return projects;
    })
  );
  promises.push(
    Student.find().then((studentList) => {

        students = studentList;
      students.sort((a, b) => {
        return a.gpa - b.gpa;
      });
      free = [...students];
      return students;
    })
  );
  Promise.all(promises).then(() => {
    //here we have all students and projects sorted projects and students with CGPA
    while (allocationStatus.size != students.length) {
        
        var curStudent = free[0];
        var firstPreference = curStudent.projects_preference[0];
        
        if(!allocationStatus.has(firstPreference)){
            allocationStatus.set(firstPreference,curStudent);
            console.log(allocationStatus);
            alloted.push(curStudent);
            free = free.filter(val=>{
                return !val.equals(curStudent);
            })
        }
        else{

            var studentCurrentlyAlloted = allocationStatus.get(firstPreference);
            var projectPreference = projects.find(val=>{
                return val.equals(firstPreference);
            });

            var studentPreference = projectPreference.students_id;

            var curStudent_index = studentPreference.indexOf(curStudent._id);
            console.log(curStudent_index);
            var studentCurrentlyAlloted_index = studentPreference.indexOf(studentCurrentlyAlloted._id);
            console.log(studentCurrentlyAlloted_index);

            if(curStudent_index < studentCurrentlyAlloted_index){

                allocationStatus.set(firstPreference,curStudent);
                alloted = alloted.filter(val=>{
                    return !val.equals(studentCurrentlyAlloted);
                });
                free = free.filter(val=>{
                    return !val.equals(curStudent);
                });
                free.push(studentCurrentlyAlloted);
                alloted.push(curStudent);

            }
            else{
                curStudent.projects_preference.shift();
            }



        }




    }
    res.send({ans:Array.from(allocationStatus)});

//     promises = [];
//     allocationStatus.forEach((value, key) => {
//       promises.push(
//         Project.findByIdAndUpdate(key, {
//           student_alloted: value,
//         })
//           .then((project) => {
//             return project;
//           })
//           .catch(() => {
//             res.json({
//               message: "error",
//               result: null,
//             });
//           })
//       );
//       promises.push(
//         Student.findByIdAndUpdate(value, {
//           project_alloted: key,
//         })
//           .then((student) => {
//             return student;
//           })
//           .catch(() => {
//             res.json({
//               message: "error",
//               result: null,
//             });
//           })
//       );
//     });
//     Promise.all(promises).then((result) => {
//       res.json({
//         message: "success",
//         result: allocationStatus,
//       });
//     });
  });
});

module.exports = router;
