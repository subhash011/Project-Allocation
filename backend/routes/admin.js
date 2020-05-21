const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const fs = require("fs");
const path = require("path");
const Mapping = require("../models/Mapping");

function studentPref(total, student) {
	return total + "," + student.name;
}

function projectPref(total, project) {
	return total + "," + project.title;
}

function combineProjects(projects, students) {
	students = students.map((val) => JSON.stringify(val));
	for (const project of projects) {
		const setA = new Set(project.students_id.map((val) => JSON.stringify(val)));
		const setB = new Set(students);
		const union = new Set([...setA, ...setB]);
		project.students_id = [...union];
		project.students_id = project.students_id.map((val) => JSON.parse(val));
		project.students_id = project.students_id
			.reduce(studentPref, "")
			.substring(1);
	}
	return projects;
}

function combineStudents(projects, students) {
	projects = projects.map((val) => JSON.stringify(val));
	for (const student of students) {
		const setA = new Set(
			student.projects_preference.map((val) => JSON.stringify(val))
		);
		const setB = new Set(projects);
		const union = new Set([...setA, ...setB]);
		student.projects_preference = [...union];
		student.projects_preference = student.projects_preference.map((val) =>
			JSON.parse(val)
		);
		student.projects_preference = student.projects_preference
			.reduce(projectPref, "")
			.substring(1);
	}
	return students;
}

//here we have to note that the folder should have write permissions else you might face problems
function generateCSVProjects(data, program_name) {
	let headers = "Title,Faculty,Student intake,Preference count,";
	var file = path.resolve(__dirname, `../CSV/projects/${program_name}.csv`);
	if (!data[0]) {
		headers = headers.substring(0, headers.length - 1) + "\n";
		fs.writeFile(file, headers, (err) => {
			if (err) {
				return "error";
			}
			return "success";
		});
		return;
	}
	var s_length = data[0].students_id.split(",").length;
	if (data[0].students_id == "") {
		s_length = 0;
		headers = headers.substring(0, headers.length - 1) + "\n";
	}
	for (let ind = 1; ind <= s_length; ind++) {
		headers += ind == s_length ? `Preference.${ind}\n` : `Preference.${ind},`;
	}

	let str = "";
	for (const fields of data) {
		str +=
			fields.title +
			"," +
			fields.faculty +
			"," +
			fields.studentIntake +
			"," +
			fields.preferenceCount +
			"," +
			fields.students_id +
			"\n";
	}

	const write_obj = headers + str;
	fs.writeFile(file, write_obj, (err) => {
		if (err) {
			return "error";
		}
		return "success";
	});
}

//here we have to note that the folder should have write permissions else you might face problems
function generateCSVStudents(data, program_name) {
	let headers = "Name,Roll no.,GPA,Preference count,";
	var file = path.resolve(__dirname, `../CSV/students/${program_name}.csv`);
	if (!data[0]) {
		headers = headers.substring(0, headers.length - 1) + "\n";
		fs.writeFile(file, headers, (err) => {
			if (err) {
				return "error";
			}
			return "success";
		});
		return;
	}
	var p_length = data[0].projects_preference.split(",").length;
	if (data[0].projects_preference == "") {
		p_length = 0;
		headers = headers.substring(0, headers.length - 1) + "\n";
	}
	for (let ind = 1; ind <= p_length; ind++) {
		headers += ind == p_length ? `Preference.${ind}\n` : `Preference.${ind},`;
	}
	let str = "";
	for (const fields of data) {
		str +=
			fields.name +
			"," +
			fields.roll_no +
			"," +
			fields.gpa +
			"," +
			fields.preferenceCount +
			"," +
			fields.projects_preference +
			"\n";
	}

	const write_obj = headers + str;
	fs.writeFile(file, write_obj, (err) => {
		if (err) {
			return "error";
		}
		return "success";
	});
}

router.get("/project/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
				(faculty) => {
					if (faculty) {
						Admin.findOne({ admin_id: faculty._id }).then((admin) => {
							if (admin) {
								const stream = admin.stream;
								Project.find({ stream: stream })
									.populate("faculty_id", null, Faculty)
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
									.populate("student_alloted", null, Student)
									.then((projects) => {
										var arr = [];
										for (const project of projects) {
											const newProj = {
												_id: project._id,
												faculty_id: project.faculty_id,
												title: project.title,
												description: project.description,
												stream: project.stream,
												studentIntake: project.studentIntake,
												duration: project.duration,
												faculty: project.faculty_id.name,
												numberOfPreferences: project.students_id.length,
												student_alloted: project.student_alloted,
												students_id: project.students_id,
											};
											arr.push(newProj);
										}
										res.json({
											message: "success",
											result: arr,
										});
									})
									.catch(() => {
										res.status(500);
									});
							} else {
								res.json({
									message: "invalid-token",
									result: null,
								});
							}
						});
					} else {
						res.json({
							message: "invalid-token",
							result: null,
						});
					}
				}
			);
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.get("/info/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						if (admin) {
							var startDate;
							if (admin.deadlines.length) {
								startDate = admin.startDate;
							}

							res.json({
								status: "success",
								stage: admin.stage,
								deadlines: admin.deadlines,
								startDate: startDate,
								projectCap: admin.project_cap,
								studentCap: admin.student_cap,
								stream: admin.stream,
								studentsPerFaculty: admin.studentsPerFaculty,
								studentCount: admin.studentCount,
							});
						} else {
							res.json({
								status: "fail",
								stage: 0,
								deadlines: "",
							});
						}
					})
					.catch((err) => {
						res.json({
							status: "fail",
							stage: 0,
							deadlines: "",
						});
					});
			} else {
				res.json({
					status: "fail",
					stage: 0,
					deadlines: "",
				});
			}
		}
	);
});

router.post("/update_stage/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const stage = req.body.stage;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			Admin.findOne({ admin_id: faculty._id })
				.then((admin) => {
					admin.stage = stage;

					admin
						.save()
						.then((result) => {
							res.json({
								status: "success",
								msg: "Successfully moved to the next stage",
							});
						})
						.catch((err) => {
							res.json({
								status: "fail",
								result: null,
							});
						});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: null,
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.post("/setDeadline/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const date = req.body.deadline;

	const format_date = new Date(date);
	format_date.setHours(18, 30);
	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			Admin.findOne({ admin_id: faculty._id })
				.then((admin) => {
					if (admin.deadlines.length == admin.stage + 1) {
						admin.deadlines.pop();
						admin.deadlines.push(format_date);
					}

					if (admin.stage == 0) {
						admin.startDate = new Date();
					}

					if (admin.stage == admin.deadlines.length)
						admin.deadlines.push(format_date);

					admin
						.save()
						.then((result) => {
							res.json({
								status: "success",
								msg: "Successfully set the deadline",
							});
						})
						.catch((err) => {
							res.json({
								status: "fail",
								result: null,
							});
						});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: null,
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.get("/stream_email/faculty/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const emails = [];
	var programAdmin;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			const stream = faculty.adminProgram;
			for (const program of faculty.programs) {
				if (program.short == stream) {
					programAdmin = program;
					break;
				}
			}
			Faculty.find({ programs: { $elemMatch: programAdmin } })
				.then((faculty) => {
					for (const fac of faculty) {
						emails.push(fac.email);
					}
					res.json({
						status: "success",
						result: emails,
						stream: stream,
						streamFull: programAdmin.full,
					});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: null,
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.get("/stream_email/student/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const emails = [];
	var programAdmin;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			const stream = faculty.adminProgram;
			for (const program of faculty.programs) {
				if (program.short == stream) {
					programAdmin = program;
					break;
				}
			}

			Student.find({ stream: stream })
				.then((students) => {
					for (const student of students) {
						emails.push(student.email);
					}

					res.json({
						status: "success",
						result: emails,
						stream: stream,
						streamFull: programAdmin.full,
					});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: null,
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.get("/all/info", (req, res) => {
	var result = {};
	var promises = [];
	var branches = [];
	Mapping.find().then((maps) => {
		branches = maps.map((val) => val.short);
		Admin.find().then((admins) => {
			if (admins) {
				for (const branch of branches) {
					promises.push(
						Admin.findOne({ stream: branch })
							.populate("admin_id")
							.then((admin) => {
								result[branch] = admin;
								return admin;
							})
					);
				}
				Promise.all(promises).then((prom) => {
					return res.json({
						message: "success",
						result: result,
					});
				});
			}
		});
	});
});

router.get("/members/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var promises = [];
	var users = {};
	var programAdmin = {};
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id }).then((admin) => {
					if (admin) {
						for (const program of faculty.programs) {
							if (program.short == admin.stream) {
								programAdmin = program;
							}
						}
						promises.push(
							Faculty.find({ programs: { $elemMatch: programAdmin } })
								.populate("project_list", null, Project)
								.then((faculties) => {
									var temp = faculties.map((val) => {
										var projectCapErr = false;
										var studentCapErr = false;
										var studentsPerFacultyErr = false;
										var projects = val.project_list;
										projects = projects.filter((project) => {
											return project.stream == admin.stream;
										});

										if (projects.length > admin.project_cap) {
											projectCapErr = true;
										}

										var student_count = 0;
										for (const project of projects) {
											student_count += project.studentIntake;
											if (project.studentIntake > admin.student_cap) {
												studentCapErr = true;
											}
										}

										if (student_count > admin.studentsPerFaculty) {
											studentsPerFacultyErr = true;
										}

										var newFac = {
											_id: val._id,
											name: val.name,
											noOfProjects: val.project_list.length,
											email: val.email,
											project_cap: projectCapErr,
											student_cap: studentCapErr,
											studentsPerFaculty: studentsPerFacultyErr,
										};
										return newFac;
									});
									users.faculties = temp;
									return users.faculties;
								})
								.catch((err) => {
									res.json({
										status: "fail",
										result: null,
									});
								})
						);
						promises.push(
							Student.find({ stream: admin.stream })
								.populate({
									path: "projects_preference",
									model: Project,
									populate: {
										path: "faculty_id",
										model: Faculty,
									},
								})
								.then((students) => {
									var tempStudents = students.map((val) => {
										var project = val.projects_preference.map((val) => {
											var newProj = {
												faculty_name: val.faculty_id.name,
												title: val.title,
												description: val.description,
												faculty_email: val.faculty_id.email,
											};
											return newProj;
										});

										var newStud = {
											_id: val._id,
											name: val.name,
											projects_preference: project,
											email: val.email,
											gpa: val.gpa,
											project_alloted: val.project_alloted,
										};
										return newStud;
									});
									users.students = tempStudents;
									return users.students;
								})
						);
						Promise.all(promises)
							.then((result) => {
								res.json({
									message: "success",
									result: users,
								});
							})
							.catch(() => {
								res.json({
									message: "error",
									result: null,
								});
							});
					}
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

router.delete("/faculty/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const mid = req.headers.body;
	var programAdmin = {};
	var streamProjects = [];
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			Admin.findOne({ admin_id: faculty._id }).then((admin) => {
				if (admin) {
					for (const program of faculty.programs) {
						if (program.short == admin.stream) {
							programAdmin = program;
						}
					}
					Project.find({
						faculty_id: mongoose.Types.ObjectId(mid),
						stream: programAdmin.short,
					}).then((projects) => {
						streamProjects = projects.map((val) => val._id.toString());
						var promises = [];
						promises.push(
							Faculty.findById(mongoose.Types.ObjectId(mid)).then((faculty) => {
								faculty.project_list = faculty.project_list.filter((val) => {
									return streamProjects.indexOf(val.toString()) == -1;
								});
								faculty.programs = faculty.programs.filter((val) => {
									return JSON.stringify(val) != JSON.stringify(programAdmin);
								});
								faculty.save().then((faculty) => {
									return faculty;
								});
							})
						);
						promises.push(
							Student.find({ stream: programAdmin.short }).then((students) => {
								var studentPromises = [];
								for (const student of students) {
									student.projects_preference = student.projects_preference.filter(
										(val) => {
											return streamProjects.indexOf(val.toString()) == -1;
										}
									);
									studentPromises.push(
										student.save().then((stud) => {
											return stud;
										})
									);
								}
								Promise.all(studentPromises).then((students) => {
									return students;
								});
							})
						);
						Promise.all(promises).then((result) => {
							promises = [];
							for (const project of streamProjects) {
								promises.push(
									Project.findByIdAndDelete(
										mongoose.Types.ObjectId(project)
									).then((pr) => {
										return pr;
									})
								);
							}
							Promise.all(promises).then((result) => {
								res.json({
									message: "success",
									result: null,
								});
							});
						});
					});
				} else {
					res.json({
						message: "invalid-token",
						result: null,
					});
				}
			});
		}
	);
});

router.delete("/student/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const mid = req.headers.body;
	Admin.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
		if (admin) {
			Student.findByIdAndDelete(mongoose.Types.ObjectId(mid))
				.then((student) => {
					if (student) return student.projects_preference;
					else return null;
				})
				.then((projects) => {
					if (projects) {
						for (const project of projects) {
							var projectid = mongoose.Types.ObjectId(project);
							promises.push(
								Project.findById(projectid).then((project) => {
									project.students_id = project.students_id.filter(
										(val) => !val.toString() == mid
									);
									project.student_alloted = project.student_alloted.filter(
										(val) => !val.toString() == mid
									);
									project.save().then((project) => {
										return project;
									});
								})
							);
						}
						Promise.all(promises).then((result) => {
							res.json({ result: result, message: "success" });
						});
					} else {
						res.json({ message: "success" });
					}
				})
				.catch((err) => {
					res.status(500);
				});
		} else {
			res.json({
				message: "invalid-token",
				result: null,
			});
		}
	});
});

router.post("/set_projectCap/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const cap = req.body.cap;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			Admin.findOne({ admin_id: faculty._id })
				.then((admin) => {
					admin.project_cap = cap;

					admin
						.save()
						.then((result) => {
							res.json({
								status: "success",
								msg: "Successfully updated the project cap",
							});
						})
						.catch((err) => {
							res.json({
								status: "fail",
								result: "save error",
							});
						});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: "admin error",
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: "faculty error",
			});
		});
});

router.post("/set_studentCap/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const studentCap = req.body.cap;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			Admin.findOne({ admin_id: faculty._id })
				.then((admin) => {
					admin.student_cap = studentCap;
					admin
						.save()
						.then((result) => {
							res.json({
								status: "success",
								msg: "Successfully updated the student cap",
							});
						})
						.catch((err) => {
							res.json({
								status: "fail",
								result: "save error",
							});
						});
				})
				.catch((err) => {
					res.json({
						status: "fail",
						result: null,
					});
				});
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.post("/set_studentsPerFacuty/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const cap = req.body.cap;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						admin.studentsPerFaculty = cap;

						admin
							.save()
							.then((result) => {
								res.json({
									status: "success",
									msg: "Successfully set the number of students per faculty!!",
								});
							})
							.catch((err) => {
								res.json({
									status: "fail",
									result: "save error",
								});
							});
					})
					.catch((err) => {
						res.json({
							status: "fail",
							result: "Admin error",
						});
					});
			} else {
				res.json({
					status: "fail",
					result: "Faculty not found",
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: "Authentication error",
			});
		});
});

router.get("/fetchAllMails/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var programAdmin = {};
	var stream;
	var faculties;
	var promises = [];
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id }).then((admin) => {
					if (admin) {
						for (const program of faculty.programs) {
							if (program.short == admin.stream) {
								programAdmin = program;
								stream = program.short;
							}
						}
						promises.push(
							Faculty.find({ programs: { $elemMatch: programAdmin } }).then(
								(faculty) => {
									faculties = faculty.map((val) => {
										return val.email;
									});
									return faculties;
								}
							)
						);
						promises.push(
							Student.find({ stream: stream }).then((student) => {
								students = student.map((val) => val.email);
								return students;
							})
						);
						Promise.all(promises).then((result) => {
							var answer = [...result[0], ...result[1]];
							res.json({
								message: "success",
								result: answer,
								streamFull: programAdmin.full,
							});
						});
					} else {
						res.json({
							message: "invalid-token",
							result: null,
						});
					}
				});
			}
		}
	);
});

router.post("/validateAllocation/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const selectedProjects = req.body.projects;
	const students = req.body.students;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						if (admin) {
							if (admin.stage >= 3) {
								var count_sum = 0;

								for (const project of selectedProjects) {
									count_sum += Number(project.studentIntake);
								}

								if (count_sum >= Math.min(students, admin.studentCount)) {
									res.json({
										status: "success",
									});
								} else {
									res.json({
										status: "fail",
									});
								}
							} else {
								Project.find({ stream: admin.stream }).then((projects) => {
									var count = 0;

									for (const project of projects) {
										count += project.studentIntake;
									}

									if (count >= admin.studentCount) {
										res.json({
											status: "success",
											msg: "Allocation can start",
										});
									} else {
										res.json({
											status: "fail",
											result: null,
										});
									}
								});
							}
						} else {
							res.json({
								status: "fail",
								result: null,
							});
						}
					})
					.catch((err) => {
						res.json({
							status: "fail",
							result: null,
						});
					});
			} else {
				res.json({
					status: "fail",
					result: null,
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.post("/set_StudentCount/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const cap = req.body.cap;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						if (admin) {
							admin.studentCount = cap;

							admin.save().then((result) => {
								res.json({
									status: "success",
									msg: "Number of Students set successfully!!",
								});
							});
						} else {
							res.json({
								status: "fail",
								result: null,
							});
						}
					})
					.catch((err) => {
						res.json({
							status: "fail",
							result: null,
						});
					});
			} else {
				res.json({
					status: "fail",
					result: null,
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.post("/revertStage/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var stage = req.body.stage;

	Faculty.findOne({ google_id: { id: id, idToken, idToken } })
		.then((faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						admin.deadlines.pop();
						if (stage >= 3) {
							admin.stage = 2;
						} else {
							if (admin.stage == 1) {
								admin.startDate = undefined;
								admin.deadlines = [];
							}
							admin.stage = stage - 1;
						}

						var promises = [];

						if (stage >= 3) {
							Project.find({ stream: admin.stream })
								.then((projects) => {
									for (const project of projects) {
										project.student_alloted = [];

										promises.push(
											project.save().then((result) => {
												return result;
											})
										);
									}

									Promise.all(promises)
										.then((result) => {
											promises = [];

											Student.find({ stream: admin.stream })
												.then((students) => {
													for (const student of students) {
														student.project_alloted = undefined;

														promises.push(
															student.save().then((result) => {
																return result;
															})
														);
													}
													Promise.all(promises)
														.then((result) => {
															admin
																.save()
																.then((result) => {
																	res.json({
																		status: "success",
																		msg:
																			"Successfully reverted back to the previous stage",
																	});
																})
																.catch((err) => {
																	res.json({
																		status: "fail",
																		result: null,
																	});
																});
														})
														.catch((err) => {
															res.json({
																status: "fail",
																result: null,
															});
														});
												})
												.catch((err) => {
													res.json({
														status: "fail",
														result: null,
													});
												});
										})
										.catch((err) => {
											res.json({
												status: "fail",
												result: null,
											});
										});
								})
								.catch((err) => {
									res.json({
										status: "fail",
										result: null,
									});
								});
						} else {
							admin.save().then((result) => {
								res.json({
									status: "success",
									msg: "Successfully reverted back to the previous stage",
								});
							});
						}
					})
					.catch((err) => {
						res.json({
							status: "fail",
							result: null,
						});
					});
			} else {
				res.json({
					status: "fail",
					result: null,
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

router.post("/reset/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var promises = [];
	var admin_info;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then((user) => {
		if (user && user.isAdmin) {
			Admin.findOne({ admin_id: user._id })
				.then((admin) => {
					admin.startDate = undefined;
					admin.deadlines = [];
					admin.stage = 0;
					admin.save().then((admin) => {
						return admin;
					});
					return admin;
				})
				.then((admin) => {
					const stream = admin.stream;
					Student.find({ stream: stream }).then((students) => {
						for (const student of students) {
							promises.push(
								Student.findByIdAndDelete(student._id).then((student) => {
									return student;
								})
							);
						}
						Promise.all(promises).then((result) => {
							promises = [];
							Project.find({ stream: stream }).then((projects) => {
								for (const project of projects) {
									promises.push(
										project
											.updateOne({ student_alloted: [], students_id: [] })
											.then((project) => {
												return project;
											})
									);
								}
								Promise.all(promises).then((result) => {
									res.json({
										message: "success",
										result: null,
									});
								});
							});
						});
					});
				});
		} else {
			res.json({
				message: "invalid-token",
				result: null,
			});
		}
	});
});

router.post("/swap/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const details = req.body;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty && faculty.isAdmin) {
				const s1 = details[0].id;
				const s2 = details[1].id;
				const p1 = details[0].pid;
				const p2 = details[1].pid;
				var promises = [];
				promises.push(
					Project.findById(mongoose.SchemaTypes.ObjectId(p1)).then(
						(project) => {
							if (project) {
								project.student_alloted.push(s2);
								project.student_alloted.filter((val) => {
									return !val.toString().equals(s1);
								});
							}
						}
					)
				);
				promises.push(
					Project.findById(mongoose.SchemaTypes.ObjectId(p2)).then(
						(project) => {
							if (project) {
								project.student_alloted.push(s1);
								project.student_alloted.filter((val) => {
									return !val.toString().equals(s2);
								});
							}
						}
					)
				);
				Promise.all(promises).then((result) => {
					res.json({
						message: "success",
						result: null,
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

router.get("/export_projects/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty && faculty.isAdmin) {
				Admin.findOne({ admin_id: faculty._id }).then((admin) => {
					if (admin) {
						var programName = admin.stream;
						var promises = [];

						promises.push(
							Student.find().then((students) => {
								students.sort((a, b) => {
									return b.gpa - a.gpa;
								});

								return students.map((val) => {
									let new_s = {
										_id: val._id,
										name: val.name,
										roll_no: val.roll_no,
									};
									return new_s;
								});
							})
						);

						promises.push(
							Project.find({ stream: programName })
								.populate("faculty_id", { name: 1 }, Faculty)
								.populate({
									path: "students_id",
									select: { _id: 1, name: 1, roll_no: 1 },
									model: Student,
								})
								.populate("student_alloted", { name: 1, roll_no: 1 }, Student)
								.then((data) => {
									var projects = data.map((val) => {
										var new_proj = {
											title: val.title,
											faculty: val.faculty_id.name,
											studentIntake: val.studentIntake,
											preferenceCount: val.students_id.length,
											students_id: val.students_id,
										};
										return new_proj;
									});
									return projects;
								})
						);

						Promise.all(promises).then((result) => {
							const students = result[0];
							const projects = result[1];

							const data = combineProjects(projects, students);
							const answer = generateCSVProjects(data, programName);

							res.json({
								message: "success",
							});
						});
					}
				});
			} else {
				res.json({
					message: "invalid-token",
				});
			}
		}
	);
});

router.get("/export_students/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(faculty) => {
			if (faculty && faculty.isAdmin) {
				Admin.findOne({ admin_id: faculty._id }).then((admin) => {
					if (admin) {
						var programName = admin.stream;
						var promises = [];

						promises.push(
							Student.find()
								.populate("projects_preference", { _id: 1, title: 1 }, Project)
								.then((students) => {
									return students.map((val) => {
										let new_s = {
											_id: val._id,
											name: val.name,
											roll_no: val.roll_no,
											gpa: val.gpa,
											preferenceCount: val.projects_preference.length,
											projects_preference: val.projects_preference,
										};
										return new_s;
									});
								})
						);

						promises.push(
							Project.find({ stream: programName }).then((data) => {
								data.sort((a, b) => {
									return a.students_id.length - b.students_id.length;
								});
								var projects = data.map((val) => {
									var new_proj = {
										_id: val._id,
										title: val.title,
									};
									return new_proj;
								});
								return projects;
							})
						);

						Promise.all(promises).then((result) => {
							const students = result[0];
							const projects = result[1];

							const data = combineStudents(projects, students);

							generateCSVStudents(data, programName);
							res.json({
								message: "success",
							});
						});
					}
				});
			} else {
				res.json({
					message: "invalid-token",
				});
			}
		}
	);
});

router.get("/download_csv/:id/:role", (req, res) => {
	const id = req.params.id;
	const role = req.params.role;
	const idToken = req.headers.authorization;

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			if (faculty) {
				Admin.findOne({ admin_id: faculty._id })
					.then((admin) => {
						if (admin) {
							const filename = admin.stream;
							if (role == "project")
								var file = path.resolve(
									__dirname,
									`../CSV/projects/${filename}.csv`
								);
							else if (role == "student")
								var file = path.resolve(
									__dirname,
									`../CSV/students/${filename}.csv`
								);
							else var file = null;

							res.download(file);
						} else {
							res.json({
								status: "fail",
								result: null,
							});
						}
					})
					.catch((err) => {
						res.json({
							status: "fail",
							result: null,
						});
					});
			} else {
				res.json({
					status: "fail",
					result: null,
				});
			}
		})
		.catch((err) => {
			res.json({
				status: "fail",
				result: null,
			});
		});
});

module.exports = router;
