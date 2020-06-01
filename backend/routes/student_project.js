const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Mapping = require("../models/Mapping");
const Admin = require("../models/Admin_Info");
const oauth = require("../config/oauth");

//fetch project details of the student's stream
router.get("/:id", (req, res) => {
	var student_projects = [];
	const id = req.params.id;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			Student.findOne({ google_id: { id: id, idToken: idToken } })
				.lean()
				.select("stream")
				.then((student) => {
					if (student) {
						return student["stream"];
					} else {
						res.json({
							message: "token-expired",
						});
						return null;
					}
				})
				.then((stream) => {
					if (stream) {
						Project.find({ stream: stream })
							.lean()
							.select("-students_id -student_alloted -isIncluded -__v")
							.populate({
								path: "faculty_id",
								select: "name email",
								model: Faculty,
							})
							.then((projects) => {
								for (const project of projects) {
									var details = {
										_id: project["_id"],
										title: project["title"],
										description: project["description"],
										duration: project["duration"],
										studentIntake: project["studentIntake"],
										faculty_name: project["faculty_id"]["name"],
										faculty_email: project["faculty_id"]["email"],
									};
									student_projects.push(details);
								}
								res.json({
									message: "success",
									result: student_projects,
								});
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

//fetch student preferences
router.get("/preference/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	Student.findOne({ google_id: { id: id, idToken: idToken } })
		.lean()
		.populate({
			path: "projects_preference",
			select: {
				_id: 1,
				title: 1,
				description: 1,
				duration: 1,
				studentIntake: 1,
			},
			model: Project,
			populate: {
				path: "faculty_id",
				select: {
					name: 1,
					email: 1,
				},
				model: Faculty,
			},
		})
		.then((student) => {
			if (student) {
				var answer = student.projects_preference.map((val) => {
					var newDetails = {
						_id: val._id,
						title: val.title,
						description: val.description,
						duration: val.duration,
						studentIntake: val.studentIntake,
						faculty_name: val.faculty_id.name,
						faculty_email: val.faculty_id.email,
					};
					return newDetails;
				});
				res.json({
					message: "success",
					result: answer,
				});
			} else {
				res.json({
					message: "invalid-token",
					result: null,
				});
			}
		})
		.catch(() => {
			res.json({
				message: "invalid-token",
				result: null,
			});
		});
});
//store student preferences
router.post("/preference/:id", (req, res) => {
	const id = req.params.id;
	const projects = req.body;
	const project_idArr = projects.map((val) =>
		mongoose.Types.ObjectId(val["_id"])
	);
	var studentStream;
	var studentID;
	const idToken = req.headers.authorization;
	oauth(idToken)
		.then((user) => {
			Student.findOneAndUpdate(
				{ google_id: { id: id, idToken: idToken } },
				{ projects_preference: project_idArr }
			)
				.then((student) => {
					if (student) {
						studentStream = student.stream;
						studentID = student._id;
						return student._id;
					} else {
						return null;
					}
				})
				.then((student) => {
					if (student) {
						Admin.findOne({ stream: student.stream }).then((admin) => {
							if (admin.stage >= 2) {
								res.json({
									message: "stage-ended",
								});
							} else {
								Project.find({ stream: studentStream }).then((projects) => {
									var promises = [];
									for (const project of projects) {
										var projIsInArr = project_idArr.some(function (val) {
											return val.equals(project._id);
										});
										var stdIsInProj = project.students_id.some(function (val) {
											return val.equals(student);
										});
										if (projIsInArr && !stdIsInProj) {
											project.students_id.push(student);
										} else if (!projIsInArr && stdIsInProj) {
											project.students_id = project.students_id.filter(
												(val) => !val.equals(student)
											);
										}
										promises.push(
											project.save().then((proj) => {
												return proj;
											})
										);
									}
									Promise.all(promises).then((result) => {
										Student.findById(studentID)
											.lean()
											.select("-google_id -date -__v")
											.populate({
												path: "projects_preference",
												select: {
													_id: 1,
													title: 1,
													description: 1,
													duration: 1,
													studentIntake: 1,
												},
												model: Project,
												populate: {
													path: "faculty_id",
													select: {
														name: 1,
														email: 1,
													},
													model: Faculty,
												},
											})
											.then((student) => {
												var answer = student.projects_preference.map((val) => {
													var newDetails = {
														_id: val._id,
														title: val.title,
														description: val.description,
														duration: val.duration,
														studentIntake: val.studentIntake,
														faculty_name: val.faculty_id.name,
														faculty_email: val.faculty_id.email,
													};
													return newDetails;
												});
												res.json({
													message: "success",
													result: answer,
												});
											});
									});
								});
							}
						});
					} else {
						res.json({ message: "invalid-token" });
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

router.post("/append/preference/:id", (req, res) => {
	const id = req.params.id;
	const projects = req.body;
	const project_idArr = projects;
	var studentStream;
	const idToken = req.headers.authorization;
	var updateResult = {
		$push: { projects_preference: { $each: project_idArr } },
	};
	Student.findOneAndUpdate(
		{ google_id: { id: id, idToken: idToken } },
		updateResult
	).then((student) => {
		if (student) {
			Admin.findOne({ stream: student.stream }).then((admin) => {
				if (admin.stage >= 2) {
					res.json({
						message: "stage-ended",
					});
				} else {
					studentStream = student.stream;
					var studentID = student._id;
					var updateCondition = {
						stream: studentStream,
						_id: { $in: project_idArr },
					};
					updateResult = {
						$push: { students_id: studentID },
					};
					Project.updateMany(updateCondition, updateResult).then((projects) => {
						res.json({
							message: "success",
							result: projects,
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
	});
});

//remove one preference
router.post("/remove/preference/:id", (req, res) => {
	const id = req.params.id;
	const projects = req.body.preference;
	var studentStream;
	const idToken = req.headers.authorization;
	var updateResult = {
		$pull: { projects_preference: projects },
	};
	Student.findOneAndUpdate(
		{ google_id: { id: id, idToken: idToken } },
		updateResult
	).then((student) => {
		if (student) {
			Admin.findOne({ stream: student.stream }).then((admin) => {
				if (admin.stage >= 2) {
					res.json({
						message: "stage-ended",
					});
				} else {
					var studentID = student._id;
					updateResult = {
						$pull: { students_id: studentID },
					};
					Project.findByIdAndUpdate(
						mongoose.Types.ObjectId(projects),
						updateResult
					).then((project) => {
						res.json({
							message: "success",
							result: null,
						});
					});
				}
			});
		} else {
			req.json({
				message: "invalid-token",
			});
		}
	});
});

//add one preference
router.post("/add/preference/:id", (req, res) => {
	const id = req.params.id;
	const projects = req.body.preference;
	var studentStream;
	const idToken = req.headers.authorization;
	var updateResult = {
		$push: { projects_preference: projects },
	};
	Student.findOneAndUpdate(
		{ google_id: { id: id, idToken: idToken } },
		updateResult
	).then((student) => {
		if (student) {
			Admin.findOne({ stream: student.stream }).then((admin) => {
				if (admin.stage >= 2) {
					res.json({
						message: "stage-ended",
					});
				} else {
					var studentID = student._id;
					updateResult = {
						$push: { students_id: studentID },
					};
					Project.findByIdAndUpdate(
						mongoose.Types.ObjectId(projects),
						updateResult
					).then((project) => {
						res.json({
							message: "success",
							result: null,
						});
					});
				}
			});
		} else {
			req.json({
				message: "invalid-token",
			});
		}
	});
});

module.exports = router;
