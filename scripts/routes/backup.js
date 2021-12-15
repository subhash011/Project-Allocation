const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmins");
const Admin = require("../models/Admin_Info");
const Programs = require("../models/Programs");
const Streams = require("../models/Streams");
const axios = require("axios").default;

const base_url = `https://pal.iitpkd.ac.in:10443/api/backup/${process.env.SECRET_KEY}/`;
const urls = [
    `${base_url}streams`,
    `${base_url}students`,
    `${base_url}faculty`,
    `${base_url}mappings`,
    `${base_url}super`,
    `${base_url}admin`,
    `${base_url}projects`,
];

function getRequests() {
    let requests = [];
    for (const url of urls) {
        requests.push(axios.get(url));
    }
    return requests
}

router.get("/", (req, res) => {
    axios.all(getRequests()).then(result => {
        let subhash = new Student({
            name: "Subhash S",
            gpa: 8.31,
            roll_no: "111801042",
            email: "111801042@smail.iitpkd.ac.in",
            stream: "UGCSE"
        });
        let vamsi = new Student({
            name: "Sai Vamsi",
            gpa: 8.42,
            roll_no: "111801002",
            email: "1118010402@smail.iitpkd.ac.in",
            stream: "UGCSE"
        });
        let streams = result[0].data;
        let students = result[1].data;
        students = [...students, ...[subhash, vamsi]];
        let faculties = result[2].data;
        let mappings = result[3].data;
        let superAdmins = result[4].data;
        let admins = result[5].data;
        for (const admin of admins) {
            admin.maxStage = admin.stage;
        }
        let projects = result[6].data;
        mongoose.connection.dropDatabase().then(() => {
            let promises = [];
            promises.push(
                Streams.insertMany(streams).then(result => {
                    return result;
                })
            );
            promises.push(
                Student.insertMany(students).then(result => {
                    return result;
                })
            );
            promises.push(
                Faculty.insertMany(faculties).then(result => {
                    return result;
                })
            );
            promises.push(
                Programs.insertMany(mappings).then(result => {
                    return result;
                })
            );
            promises.push(
                SuperAdmin.insertMany(superAdmins).then(result => {
                    SuperAdmin.findOneAndUpdate({email: "pap@smail.iitpkd.ac.in"}, {
                        google_id: {
                            id: process.env.PAP_ID,
                            idToken: 1
                        }
                    }).then(() => {
                        return result;
                    })
                })
            );
            promises.push(
                Admin.insertMany(admins).then(result => {
                    return result;
                })
            );
            promises.push(
                Project.insertMany(projects).then(result => {
                    return result;
                })
            );
            Promise.all(promises).then(result => {
                let updateRes = {
                    name: process.env.MY_NAME,
                    email: process.env.MY_EMAIL,
                    google_id: {id: process.env.MY_ID, idToken: "1"}
                };
                Faculty.findOneAndUpdate({email: "unnikrishnan@iitpkd.ac.in"}, updateRes).then(() => {
                    res.send(result);
                });
            })
        });
    })
})

module.exports = router;
