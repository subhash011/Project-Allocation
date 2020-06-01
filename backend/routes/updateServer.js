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

router.post("/:build", (req, res) => {
  const param = req.params.build;
  var file_path = path.resolve(
    __dirname,
    `../../Build-Script/build.sh ${param}`
  );
  executeScript(file_path).then((result) => {
    res.status(200).send(result);
  });
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
