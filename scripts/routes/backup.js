const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmins");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
const Streams = require("../models/Streams");
const axios = require("axios").default;

var base_url = `https://pal.iitpkd.ac.in:10443/api/backup/${process.env.SECRET_KEY}/`;
var urls = [
    `${base_url}streams`,
    `${base_url}students`,
    `${base_url}faculty`,
    `${base_url}mappings`,
    `${base_url}super`,
    `${base_url}admin`,
    `${base_url}projects`,
]

function getRequests() {
    let requests = [];
    for (const url of urls) {
        requests.push(axios.get(url));
    }
    return requests
}

router.get("/",(req,res) => {
    axios.all(getRequests()).then(result => {
        let streams = result[0].data;
        let students = result[1].data;
        let faculties = result[2].data;
        let mappings = result[3].data;
        let superAdmins = result[4].data;
        let admins = result[5].data;
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
                Mapping.insertMany(mappings).then(result => {
                    return result;
                })
            );
            promises.push(
                SuperAdmin.insertMany(superAdmins).then(result => {
                    return result;
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
                res.send(result);
            })
        });
    })
})

module.exports = router;