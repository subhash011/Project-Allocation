const express = require("express");
const router = express.Router();
const cp = require("child_process");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
async function executeScript(comm) {
	try {
		const { stdout, stderr } = await exec(comm);
		console.log(stdout);
		return {
			stdout: stdout,
			stderr: stderr,
		};
	} catch {}
	(err) => {
		res.json({
			error: err,
		});
	};
}

router.post("/", (req, res) => {
	console.log(req.headers, req.params)
	// const param = req.params.build;
	// const password = process.env.PASSWORD;
	// const path = process.env.PATH;
	// req.setTimeout(300000);
	// res.setTimeout(300000);
	// var file_path = path.resolve(
	// 	__dirname,
	// 	`../../Build-Script/build.sh ${param} ${password} ${path}`
	// );
	// executeScript(file_path).then((result) => {
	// 	res.status(200).send(result);
	// });
});

router.post("/logs", (req, res) => {
	cp.exec("pm2 logs", (err, stdout, stderr) => {
		res.json({
			out: stdout,
			err: stderr,
		});
	});
});

router.post("/commands/:command", (req, res) => {
	const command = req.params.command;
	cp.exec(command, (err, stdout, stderr) => {
		res.json({
			out: stdout,
			err: stderr,
		});
	});
});

module.exports = router;
