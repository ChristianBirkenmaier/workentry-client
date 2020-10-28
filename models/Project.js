const mongoose = require("mongoose");

const projectschema = new mongoose.Schema({
    projectName: String,
});

module.exports = mongoose.model("Project", projectschema);
