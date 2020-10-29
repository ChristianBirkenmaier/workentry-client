const mongoose = require("mongoose");

async function connect() {
    console.info("inside connection");
    await mongoose.connect(
        "mongodb+srv://admin:px9zLEPv2CRBQBaQ@cluster0.erlu7.mongodb.net/noerpel?retryWrites=true&w=majority",
        { useNewUrlParser: true }
    );

    const db = mongoose.connection;
    const message = [];
    db.on("error", (e) => {
        // console.error.bind(console, "connection error:");
        console.error(e);
        message.push(e);
    });
    db.once("open", function () {
        console.info("MongoDB connected.");
        message.push("Connected to db");
    });

    return { db, message };
}
module.exports = connect;
