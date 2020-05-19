const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const SuperAdmin = require("../models/SuperAdmin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin_Info");
const Mapping = require("../models/Mapping");
const Streams = require("../models/Streams");
router.get("/maps", (req, res) => {
	Mapping.find()
		.then((maps) => {
			if (maps) {
				res.json({
					message: "success",
					result: maps,
				});
			} else {
				res.json({
					message: "success",
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
});

router.post("/maps/:id", (req, res) => {
	const map = req.body;
	const id = req.params.id;
	const idToken = req.headers.authorization;
	SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
		.then((user) => {
			if (user) {
				const newMap = new Mapping({
					short: map.short,
					full: map.full,
					map: map.map,
					length: map.map.split("|")[0],
				});
				newMap.save().then((map) => {
					res.json({
						message: "success",
						result: map,
					});
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
				message: "invalid-client",
				result: null,
			});
		});
});

router.delete("/maps/remove/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const short = req.headers.body;
	SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(user) => {
			if (user) {
				Mapping.findOneAndDelete({ short: short })
					.then((map) => {
						res.json({
							message: "success",
							result: map,
						});
					})
					.catch(() => {
						res.json({
							message: "invalid-token",
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

router.get("/branches", (req, res) => {
	Streams.find()
		.then((maps) => {
			if (maps) {
				res.json({
					message: "success",
					result: maps,
				});
			} else {
				res.json({
					message: "success",
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
});

router.post("/branches/:id", (req, res) => {
	const map = req.body;
	const id = req.params.id;
	const idToken = req.headers.authorization;
	SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } })
		.then((user) => {
			if (user) {
				const newMap = new Streams({
					short: map.short,
					full: map.full,
				});
				newMap.save().then((map) => {
					res.json({
						message: "success",
						result: map,
					});
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
				message: "invalid-client",
				result: null,
			});
		});
});

router.delete("/branches/remove/:id", (req, res) => {
	const id = req.params.id;
	const idToken = req.headers.authorization;
	const short = req.headers.body;
	SuperAdmin.findOne({ google_id: { id: id, idToken: idToken } }).then(
		(user) => {
			if (user) {
				Streams.findOneAndDelete({ short: short })
					.then((map) => {
						res.json({
							message: "success",
							result: map,
						});
					})
					.catch(() => {
						res.json({
							message: "invalid-token",
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

router.get("/allDetails", (req, res) => {
	var promises = [];
	var students = {};
});

module.exports = router;
