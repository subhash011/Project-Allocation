const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Student = require("../models/Student");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");

function combineProjects(projects, students) {
	students = students;
	projects = projects;
	studentIDS = students.map((val) => val._id);
	projectIDS = projects.map((val) => val._id);
	var studentsPreferred = {};
	var studentsNotPreferred = {};
	for (var project of projects) {
		studentsPreferred[project._id.toString()] = project.students_id;
		studentsNotPreferred[project._id.toString()] = project.not_students_id;
		project.students_id = [...studentsPreferred[project._id.toString()],...studentsNotPreferred[project._id.toString()]];
	}
	return projects;
}

function combineStudents(projects, students) {
	students = students;
	projects = projects;
	studentIDS = students.map((val) => val._id);
	projectIDS = projects.map((val) => val._id);
	for (const student of students) {
		let preferredProjects = student.projects_preference.map(val => val.toString());
		let projectsNotPreferred = projects.filter(val => {
			return !preferredProjects.includes(val._id.toString());
		});
		let sortedPreferences = projectsNotPreferred.sort((a,b) => {
			return (a.not_students_id.indexOf(student._id) + a.students_id.length) - (b.not_students_id.indexOf(student._id) + b.students_id.length);
		});
		sortedPreferences = sortedPreferences.map(val => val._id.toString());
		student.projects_preference = [...student.projects_preference, ...sortedPreferences];
		student.projects_preference = student.projects_preference.map((val) =>
			mongoose.Types.ObjectId(val)
		);
	}
	return students;
}

router.post("/start/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var projects = [];
	var students = [];
	var alloted = [];
	var free = [];
	var allocationStatus = {};
	var promises = [];
	var projects = req.body.projects;
	var pids = [];
	var stream;
	pids = projects.map((val) => val._id);
	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.lean()
		.select({
			isAdmin: 1,
			adminProgram: 1,
		})
		.then((faculty) => {
			if (faculty) {
				if (faculty.isAdmin) {
					stream = faculty.adminProgram;

					var projectsCondition = {
						stream: stream,
						_id: { $in: pids },
					};

					promises.push(
						Project.find(projectsCondition).then((projectList) => {
							projects = projectList;
							projects.forEach(project => {
								project.tempStudentsIDs = project.students_id;
								project.tempNotStudentsIDs = project.not_students_id;
							})
							projects.sort((a, b) => {
								return a.students_id.length - b.students_id.length;
							});
							return projects;
						})
					);
					promises.push(
						Student.find({ stream: stream }).then((studentList) => {
							students = studentList;
							students.sort((a, b) => {
								return b.gpa - a.gpa;
							});
							students = students.filter((val) => val.isRegistered);
							return students;
						})
					);
					Promise.all(promises).then(() => {
						combineStudents(projects, students);
						combineProjects(projects, students);
						free = [...students];
						var curStudent, firstPreference, firstProject;
						while (free.length > 0) {
							curStudent = free[0];
							firstPreference = curStudent.projects_preference[0];
							if (!firstPreference) {
								free.shift();
								continue;
							}
							firstProject = projects.find((val) => {
								return val.equals(firstPreference.toString());
							});
							if (!firstProject) {
								curStudent.projects_preference.shift();
								continue;
							}
							if (!allocationStatus[firstPreference]) {
								allocationStatus[firstPreference] = [];
								allocationStatus[firstPreference].push(curStudent);
								free = free.filter((val) => {
									return !val.equals(curStudent);
								});
								alloted.push(curStudent);
							} else {
								if (
									allocationStatus[firstPreference].length <
									firstProject.studentIntake
								) {
									allocationStatus[firstPreference].push(curStudent);
									allocationStatus[firstPreference].sort((a, b) => {
										return (
											firstProject.students_id.indexOf(a._id) -
											firstProject.students_id.indexOf(b._id)
										);
									});
									free = free.filter((val) => {
										return !val.equals(curStudent);
									});
									alloted.push(curStudent);
								} else {
									var studentCurrentlyAlloted =
										allocationStatus[firstPreference._id][
											allocationStatus[firstPreference._id].length - 1
										];
									var currentlyAllotedIndex = firstProject.students_id.indexOf(
										studentCurrentlyAlloted._id
									);
									var curStudentIndex = firstProject.students_id.indexOf(
										curStudent._id
									);
									if (curStudentIndex < currentlyAllotedIndex) {
										allocationStatus[firstPreference].pop();
										studentCurrentlyAlloted.projects_preference.shift();
										allocationStatus[firstPreference].push(curStudent);
										allocationStatus[firstPreference].sort((a, b) => {
											return (
												firstProject.students_id.indexOf(a._id) -
												firstProject.students_id.indexOf(b._id)
											);
										});
										free = free.filter((val) => {
											return !val.equals(curStudent);
										});
										alloted = alloted.filter((val) => {
											return !val.equals(studentCurrentlyAlloted);
										});
										free.push(studentCurrentlyAlloted);
										alloted.push(curStudent);
									} else {
										curStudent.projects_preference.shift();
									}
								}
							}
						}
						//send the allocation status here.
						var student_alloted = [];
						var promises = [];
						Project.find({ stream: stream })
							.populate({
								path: "faculty_id",
								select: "_id name",
								model: Faculty,
							})
							.populate({
								path: "students_id",
								select: { name: 1, roll_no: 1, project_alloted: 1 },
								model: Student,
								populate: {
									path: "project_alloted",
									select: { title: 1, faculty_id: 1 },
									model: Project,
									populate: {
										path: "faculty_id",
										select: { name: 1 },
										model: Faculty,
									},
								},
							})
							.populate({
								path: "student_alloted",
								select: "name roll_no gpa",
								model: Student,
							})
							.then((projects) => {
								var arr = [];
								for (const project of projects) {
									var studentsAlloted = [];
									const allocation = allocationStatus[project._id.toString()];
									if (allocation) {
										studentsAlloted = allocation.map((val) => {
											var newStud = {
												name: val.name,
												roll_no: val.roll_no,
												gpa: val.gpa,
											};
											return newStud;
										});
									} else {
										studentsAlloted = [];
									}
									const newProj = {
										_id: project._id,
										faculty_id: project.faculty_id._id,
										title: project.title,
										description: project.description,
										stream: project.stream,
										duration: project.duration,
										faculty: project.faculty_id.name,
										studentIntake: project.studentIntake,
										numberOfPreferences: project.students_id.length,
										student_alloted: studentsAlloted,
										students_id: project.students_id,
										not_students_id:project.not_students_id,
										isIncluded: project.isIncluded,
									};
									arr.push(newProj);
								}
								var resultMap = {};
								for (const key in allocationStatus) {
									if (allocationStatus.hasOwnProperty(key)) {
										const studentsList = allocationStatus[key].map(
											(val) => val._id
										);
										resultMap[key] = studentsList;
									}
								}
								res.json({
									message: "success",
									result: arr,
									allocationMap: resultMap,
								});
							});
					});
				}
			} else {
				res.json({
					message: "invalid-token",
					result: null,
				});
			}
		})
		.catch((err) => {
			res.json({
				message: "invalid-token",
				result: null,
			});
		});
});

module.exports = router;
