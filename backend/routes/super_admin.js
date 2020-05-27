const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
const oauth = require("../config/oauth");
Array.prototype.contains = function (v) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === v) return true;
	}
	return false;
};

Array.prototype.unique = function () {
	var arr = [];
	for (var i = 0; i < this.length; i++) {
		if (!arr.contains(this[i]) && this[i] != "") {
			arr.push(this[i]);
		}
	}
	return arr;
};

router.post("/register/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const user = req.body;
	oauth(idToken).then((response) => {
		const newUser = new SuperAdmin({
			name: user.name,
			google_id: {
				id: id,
				idToken: idToken,
			},
			email: user.email,
		});
		newUser
			.save()
			.then((result) => {
				res.json({
					registration: "success",
				});
			})
			.catch((err) => {
				res.json({
					registration: "fail",
				});
			});
	});
});

router.get("/student/details/:id", (req, res) => {
	var student = {};
	const id = req.params.id;
	const idToken = req.headers.authorization;
	var branches = [];
	Mapping.find()
		.lean()
		.then((maps) => {
			branches = maps.map((val) => val.short);
			for (const branch of branches) {
				student[branch] = [];
			}
		})
		.then((user) => {
			SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Student.find()
							.lean()
							.select(
								"-google_id -date -__v -projects_preference -project_alloted"
							)
							.then((students) => {
								if (students) {
									for (const branch of branches) {
										var temp = students.filter((student) => {
											return student.stream == branch;
										});
										temp = temp.map((val) => {
											var newStud = {
												_id: val._id,
												name: val.name,
												gpa: val.gpa,
												stream: val.stream,
												email: val.email,
												roll_no: val.roll_no,
												isRegistered: val.isRegistered,
											};
											return newStud;
										});
										student[branch] = temp;
									}
									res.json({
										message: "success",
										result: student,
									});
								} else {
									res.json({
										message: "success",
										result: "no-students",
									});
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.get("/faculty/details/:id", (req, res) => {
	var streamwise = [];
	const id = req.params.id;
	var faculty = {};
	var branches = [];
	const idToken = req.headers.authorization;
	Mapping.find()
		.lean()
		.then((maps) => {
			branches = maps.map((val) => val.short);
			for (const branch of branches) {
				faculty[branch] = [];
			}
		})
		.then((user) => {
			SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Faculty.find()
							.lean()
							.select("-google_id -date -__v -project_list")
							.then((faculties) => {
								if (faculties) {
									for (const branch of branches) {
										var temp = faculties.filter((faculty) => {
											arr = faculty.programs.map((x) => x.short);
											return arr.contains(branch);
										});
										temp = temp.map((val) => {
											var newFac = {
												_id: val._id,
												name: val.name,
												email: val.email,
												stream: val.stream,
												isAdmin: val.isAdmin,
												adminProgram: val.adminProgram,
											};
											return newFac;
										});
										faculty[branch] = temp;
									}
									res.json({
										message: "success",
										result: faculty,
									});
								} else {
									res.json({
										message: "success",
										result: "no-faculties",
									});
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.delete("/student/:id", (req, res) => {
	const id = mongoose.Types.ObjectId(req.headers.body);
	const google_user_id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			SuperAdmin.findOne({
				google_id: { id: google_user_id, idToken: idToken },
			})
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Student.findByIdAndDelete(id).then(() => {
							var updateCondition = {
								$pullAll: { students_id: [id], student_alloted: [id] },
							};
							Project.updateMany({}, updateCondition).then(() => {
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
				});
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.delete("/faculty/:id", (req, res) => {
	const id = mongoose.Types.ObjectId(req.headers.body);
	const google_user_id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			SuperAdmin.findOne({
				google_id: { id: google_user_id, idToken: idToken },
			})
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Faculty.findByIdAndDelete(id).then((faculty) => {
							var projectList = faculty.project_list;
							Project.deleteMany({ _id: { $in: projectList } }).then(() => {
								var updateResult = {
									$pullAll: {
										projects_preference: projectList,
									},
								};
								Student.updateMany({}, updateResult).then(() => {
									var updateCondition = {
										project_alloted: { $in: projectList },
									};
									updateResult = { $unset: { project_alloted: "" } };
									Student.updateMany(updateCondition, updateResult).then(() => {
										res.json({
											message: "success",
											result: null,
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.post("/addAdmin/:id", (req, res) => {
	const id = req.body.id;
	const branch = req.body.branch;
	const google_user_id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			SuperAdmin.findOne({
				google_id: { id: google_user_id, idToken: idToken },
			})
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
							isAdmin: true,
							adminProgram: branch,
						})
							.then((faculty) => {
								if (faculty) {
									var admin = new Admin({
										admin_id: faculty._id,
										stream: branch,
										deadlines: [],
									});
									admin
										.save()
										.then((admin) => {
											res.json({
												message: "success",
												result: faculty.isAdmin,
											});
										})
										.catch((err) => {
											res.json({
												message: "error",
												result: null,
											});
										});
								} else {
									res.json({
										message: "success",
										result: "no-faculty",
									});
								}
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.post("/removeAdmin/:id", (req, res) => {
	const id = req.body.id;
	const google_user_id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			SuperAdmin.findOne({
				google_id: { id: google_user_id, idToken: idToken },
			})
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Faculty.findByIdAndUpdate(mongoose.Types.ObjectId(id), {
							isAdmin: false,
							$unset: { adminProgram: 1 },
						})
							.then((faculty) => {
								if (faculty) {
									Admin.findOneAndDelete({
										admin_id: faculty._id,
									}).then((admin) => {
										res.json({
											message: "success",
											result: faculty.adminProgram,
										});
									});
								} else {
									res.json({
										message: "success",
										result: "no-faculty",
									});
								}
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.get("/projects/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
				.lean()
				.select("_id")
				.then((user) => {
					if (user) {
						Project.find()
							.populate({
								path: "faculty_id",
								select: { name: 1, _id: 1 },
								model: Faculty,
							})
							.populate({
								path: "student_alloted",
								select: { name: 1, roll_no: 1 },
								model: Student,
							})
							.then((projects) => {
								var arr = [];
								for (const project of projects) {
									const newProj = {
										title: project.title,
										stream: project.stream,
										duration: project.duration,
										faculty: project.faculty_id.name,
										numberOfPreferences: project.students_id.length,
										faculty_id: project.faculty_id._id,
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
		})
		.catch(() => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

router.post("/create/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then(
			SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
				(user) => {
					if (user) {
						const newElement = new Mapping(req.body);
						newElement
							.save()
							.then((ele) => {
								if (ele) {
									res.json({
										message: "success",
										result: ele,
									});
								} else {
									res.json({
										message: "error",
										result: null,
									});
								}
							})
							.catch(() => {
								res.json({
									message: "error",
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
			)
		)
		.catch((err) => {
			res.json({
				message: "invalid-client",
				result: null,
			});
		});
});

module.exports = router;
