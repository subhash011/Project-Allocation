const Mapping = require("../models/Mapping");

branches = [];
programs = [];

Mapping.find().then((maps) => {
    for (const map of maps) {
        branches.push(map.short);
    }
    for (const map of maps) {
        const newpr = {
            short: map.short,
            full: map.full,
        };
        programs.push(newpr);
    }
});

module.exports = {
    branches: branches,
    programs: programs,
};