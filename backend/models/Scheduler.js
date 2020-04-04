const mongoose = require("mongoose");

const Scheduler = class Scheduler {
    role;
    stream;
    toSendMail;
    stage;
    constructor(role, stream, toSendMail, stage) {
        this.role = role;
        this.stream = stream;
        this.toSendMail = toSendMail;
        this.stage = stage;
    }
};

module.exports = Scheduler;