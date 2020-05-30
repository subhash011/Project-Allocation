const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue,
		randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function getRandom(arr, n) {
	var result = new Array(n),
		len = arr.length,
		taken = new Array(len);
	if (n > len)
		throw new RangeError("getRandom: more elements taken than available");
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

router.post("/add/:n", (req, res) => {
	const count = req.params.n;
	var gpas = [];
	var names = [];
	var roll = [];
	var promises = [];
	for (let index = 0; index < count; index++) {
		names.push("s" + (index + 1));
		roll.push("1118010" + (index + 1 < 9 ? "0" + (index + 1) : index + 1));
		gpas.push((Math.random() * 5 + 5).toFixed(2));
		const student = new Student({
			name: names[index],
			gpa: gpas[index],
			roll_no: roll[index],
			email:
				index == 1 || index == 41
					? roll[index] + "@smail.iitpkd.ac.in"
					: roll[index] + "@abc.com",
			stream: "UGCSE",
			isRegistered: true,
		});
		promises.push(
			student.save().then((result) => {
				return result;
			})
		);
	}
	Promise.all(promises).then((result) => {
		res.json(result);
	});
});

router.post("/projects/add", (req, res) => {
	var promises = [];
	promises.push(
		Student.find().then((students) => {
			return students;
		})
	);
	promises.push(
		Project.find().then((projects) => {
			return projects;
		})
	);
	Promise.all(promises).then((result) => {
		var promises = [];
		var inner = [];
		const students = result[0];
		const projects = result[1];
		for (const student of students) {
			const number = 30;
			const arr = getRandom(projects, number);
			shuffle(arr);
			student.projects_preference = arr;
			promises.push(
				student.save().then((student) => {
					return student;
				})
			);
		}
		Promise.all(promises).then((result) => {
			promises = [];
			Project.find().then((projects) => {
				for (const project of projects) {
					const arr = result.filter((val) => {
						return val.projects_preference.indexOf(project._id) != -1;
					});
					shuffle(arr);
					project.students_id = arr;
					promises.push(
						project.save().then((result) => {
							return result;
						})
					);
				}
				Promise.all(promises).then((result) => {
					res.json(result);
				});
			});
		});
	});
});

module.exports = router;
