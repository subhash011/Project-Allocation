const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Admin = require("../models/Admin_Info");
oauth = require("../config/oauth");

router.post("/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const stream = req.body.stream;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((user) => {
			if (user) {
				Project.find({ faculty_id: user._id })
					.then((projects) => {
						const stream_projects = [];
						if (projects) {
							for (const proj of projects) {
								if (proj.stream == stream) {
									stream_projects.push(proj);
								}
							}
							res.json({
								status: "success",
								project_details: stream_projects,
							});
						} else {
							res.json({
								stauts: "fail",
								project_details: "Error",
								students: "Error",
							});
						}
					})
					.catch((err) => {
						res.json({
							stauts: "fail",
							project_details: "Project Not Found",
							students: "Error",
						});
					});
			} else {
				res.json({
					status: "fail",
					project_details: "Not valid faculty id",
					students: "Error",
				});
			}
		})
		.catch((err) => {
			res.json({
				stauts: "fail",
				project_details: "Faculty Not Found",
				students: "Error",
			});
		});
});

router.post("/add/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const project_details = req.body;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((user) => {
			const stream = project_details.stream;
			if (user) {
				var project = new Project({
					title: project_details.title,
					duration: project_details.duration,
					studentIntake: project_details.studentIntake,
					description: project_details.description,
					stream: project_details.stream,
					faculty_id: user._id,
				});

				Admin.findOne({ stream: stream }).then((admin) => {
					if (admin) {
						Project.find({ faculty_id: user._id, stream: stream })
							.then((projects) => {
								const count = projects.length;
								var student_count = 0;

								for (const proj of projects) {
									student_count += proj.studentIntake;
								}

								if (admin.project_cap == null) {
									res.json({
										save: "projectCap",
										msg: "Please contact the admin to set the project cap",
									});
								} else if (count >= admin.project_cap) {
									res.json({
										save: "projectCap",
										msg: `Max number of projects that can be added are ${admin.project_cap}`,
									});
								} else {
									if (project_details.studentIntake > admin.student_cap) {
										res.json({
											save: "studentCap",
											msg: `Max number of students that can be taken per project are ${admin.student_cap}`,
										});
									}

									if (
										student_count + Number(project_details.studentIntake) >
										admin.studentsPerFaculty
									) {
										res.json({
											save: "studentsPerFaculty",
											msg: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`,
										});
									} else {
										project
											.save()
											.then((result) => {
												user.project_list.push(project._id);
												user.save().then((ans) => {
													res.json({
														save: "success",
														msg: "Your project has been successfully added",
													});
												});
											})
											.catch((err) => {
												res.json({
													save: "fail",
													msg: " There was an error, Please try again!", //Display the messages in flash messages
												});
											});
									}
								}
							})
							.catch((err) => {
								res.json({
									save: "fail",
									msg: " There was an error, Please try again!", //Display the messages in flash messages
								});
							});
					} else {
						res.json({
							status: "fail",
							result: null,
						});
					}
				});
			} else {
				res.json({
					save: "fail",
					msg: "User not found",
				});
			}
		})
		.catch((err) => {
			res.json({
				save: "fail",
				msg: "Error in finding user",
			});
		});
});

router.post("/applied/:id", (req, res) => {
	const id = req.params.id;
	const project_id = req.body.project;
	const idToken = req.headers.authorization;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			if (faculty) {
				Project.findById(mongoose.Types.ObjectId(project_id))
					.populate("students_id", null, Student)
					.then((project) => {
						res.json({
							status: "success",
							students: project["students_id"],
						});
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				res.json({
					status: "fail",
					students: "Server Error",
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				students: "Authentication Error",
			});
		});
});

router.post("/include_projects/:id", (req, res) => {
	const id = req.params.id;
	var projects = req.body.projects;
	projects = projects.map((val) => mongoose.Types.ObjectId(val));
	const idToken = req.headers.authorization;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty) {
				const faculty_id = faculty._id;
				var conditions = {
					faculty_id: faculty_id,
				};
				Project.updateMany(conditions, { isIncluded: false }).then(() => {
					conditions = {
						_id: { $in: projects },
						faculty_id: faculty_id,
					};
					Project.updateMany(conditions, { isIncluded: true }).then(() => {
						res.json({
							message: "success",
							result: null,
						});
					});
				});
			} else {
				res.json({
					message: "invalid-token",
					result: null,
				});
			}
		}
	);
});

router.post("/save_preference/:id", (req, res) => {
	const id = req.params.id;
	const student = req.body.student;
	const project_id = req.body.project_id;
	const idToken = req.headers.authorization;
	let student_ids = [];

	student.forEach((per) => {
		student_ids.push(mongoose.Types.ObjectId(per._id));
	});

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((user) => {
			if (user) {
				Project.findById({ _id: project_id })
					.then((project) => {
						project.students_id = student_ids;
						project
							.save()
							.then((result) => {
								res.json({
									status: "success",
									msg: "Your preferences are saved",
								});
							})
							.catch((err) => {
								res.json({
									status: "fail",
									msg: "Reload and Please try again !",
								});
							});
					})
					.catch((err) => {
						res.json({
							status: "fail",
							msg: "Project Not Found!!! Please Reload",
						});
					});
			} else {
				res.json({
					status: "fail",
					msg: "Invalid Login",
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				msg: "Authentication Error",
			});
		});
});

router.post("/update/:id", (req, res) => {
	const project_id = mongoose.Types.ObjectId(req.params.id);
	const title = req.body.title;
	const duration = Number(req.body.duration);
	const studentIntake = Number(req.body.studentIntake);
	const description = req.body.description;

	Project.findById({ _id: project_id })
		.then((project) => {
			project.title = title;
			project.duration = duration;
			project.studentIntake = studentIntake;
			project.description = description;

			const stream = project.stream;

			Admin.findOne({ stream: stream }).then((admin) => {
				if (admin) {
					Project.find({ faculty_id: project.faculty_id, stream: stream }).then(
						(projects) => {
							const count = projects.length;
							var student_count = 0;

							for (const proj of projects) {
								if (proj._id.toString() == project_id.toString()) {
									student_count += studentIntake;
								} else student_count += proj.studentIntake;
							}

							if (project.studentIntake > admin.student_cap) {
								res.json({
									status: "fail1",
									msg: `Max number of students that can be taken per project are ${admin.student_cap}`,
								});
							}

							if (student_count > admin.studentsPerFaculty) {
								res.json({
									status: "fail2",
									msg: `Total number of students per faculty cannot exceed ${admin.studentsPerFaculty}`,
								});
							} else {
								project
									.save()
									.then((result) => {
										res.json({
											status: "success",
											msg: "Your Project was successfully updated",
										});
									})
									.catch((err) => {
										res.json({
											status: "fail",
											msg: "Project Not Saved. Please reload and try again!!!",
										});
									});
							}
						}
					);
				}
			});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				msg: "Project Not Found",
			});
		});
});

router.delete("/delete/:id", (req, res) => {
	const id = req.params.id;

	Project.findByIdAndRemove({ _id: id })
		.then((result) => {
			let students_id = result.students_id;
			let faculty_id = result.faculty_id;

			Faculty.findById({ _id: faculty_id }).then((faculty) => {
				let project_list = faculty.project_list;
				let new_list = project_list.filter((project) => {
					if (project.toString() != id) {
						return project;
					}
				});
				faculty.project_list = new_list;

				faculty
					.save()
					.then((result) => {
						Student.find({
							_id: { $in: students_id },
						})
							.then((students) => {
								students.forEach((student) => {
									let project_pref = student.projects_preference;
									student.projects_preference = project_pref.filter(
										(project_id) => {
											if (project_id.toString() != id) {
												return project_id;
											}
										}
									);
								});

								students.forEach((student) => {
									student.save();
								});

								res.json({
									status: "success",
									msg: "The project has been successfully deleted",
								});
							})
							.catch((err) => {
								res.json({
									status: "fail",
									msg: "Unable to update student preferences",
								});
							});
					})
					.catch((err) => {
						res.json({
							status: "fail",
							msg: "Unable to Update the faculty details",
						});
					});
			});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				msg: "Please reload and try again!!!",
			});
		});
});

module.exports = router;
