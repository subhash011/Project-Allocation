const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Student = require("../models/Student");
const Service = require("../helper/serivces");
var branches = Service.branches;
var programs = Service.programs;

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

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			const stream = faculty.stream;

			Faculty.find({ stream: stream })
				.then((faculty) => {
					for (const fac of faculty) {
						emails.push(fac.email);
					}

					res.json({
						status: "success",
						result: emails,
						stream: stream,
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

	Faculty.findOne({ google_id: { id: id, idToken: idToken } })
		.then((faculty) => {
			const stream = faculty.stream;

			Student.find({ stream: stream })
				.then((students) => {
					for (const student of students) {
						emails.push(student.email);
					}

					res.json({
						status: "success",
						result: emails,
						stream: stream,
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
	Admin.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
		if (admin) {
			Faculty.findByIdAndDelete(mongoose.Types.ObjectId(mid)).then(
				(faculty) => {
					res.json({
						message: "success",
						result: null,
					});
				}
			);
		} else {
			res.json({
				message: "invalid-token",
				result: null,
			});
		}
	});
});

router.delete("/student/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const mid = req.headers.body;
	Admin.findOne({ google_id: { id: id, idToken: idToken } }).then((admin) => {
		if (admin) {
			Student.findByIdAndDelete(mongoose.Types.ObjectId(mid)).then(
				(student) => {
					res.json({
						message: "success",
						result: null,
					});
				}
			);
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

module.exports = router;
