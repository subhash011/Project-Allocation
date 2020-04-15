const Mapping = require("../models/Mapping");

branches = [];

Mapping.find().then((maps) => {
    for (const map of maps) {
        branches.push(map.short);
    }
});

module.exports = {
    branches: branches,
};