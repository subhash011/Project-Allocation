const express = require("express");
const router = express.Router();
const cp = require("child_process");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const crypto = require('crypto')


const secret = process.env.SECRET_KEY;

const sigHeaderName = 'x-hub-signature'


function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body)
  if (!payload) {
    return next('Request body empty')
  }

  const sig = req.get(sigHeaderName) || ''
  const hmac = crypto.createHmac('sha1', secret)
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
  const checksum = Buffer.from(sig, 'utf8')
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
  }
  return next()
}

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


router.post("/",verifyPostData, (req, res) => {
	const parameter = "yes";
	req.setTimeout(300000);
	res.setTimeout(300000);
	var file_path = path.resolve(
		__dirname,
		`../../Build-Script/build.sh ${parameter}`
	);
	executeScript(file_path).then((result) => {
		res.status(200).send(result);
	});
});

router.use((err,req,res,next) => {
	if (err) console.error(err)
  	res.status(403).send({error:err,message:'Request body was not signed or verification failed'});
});

// router.post("/logs", (req, res) => {
// 	cp.exec("pm2 logs", (err, stdout, stderr) => {
// 		res.json({
// 			out: stdout,
// 			err: stderr,
// 		});
// 	});
// });

// router.post("/commands/:command", (req, res) => {
// 	const command = req.params.command;
// 	cp.exec(command, (err, stdout, stderr) => {
// 		res.json({
// 			out: stdout,
// 			err: stderr,
// 		});
// 	});
// });

module.exports = router;
