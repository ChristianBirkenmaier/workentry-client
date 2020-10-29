const mongoose = require("mongoose");
const { Schema } = mongoose;

const workentrySchema = new Schema({
    categoryName: { type: Schema.Types.ObjectId, ref: "Category" },
    projectname: { type: Schema.Types.ObjectId, ref: "Project" },
    fromDate: String,
    untilDate: String,
    optionalText: String,
});

module.exports = mongoose.model("Workentry", workentrySchema);
