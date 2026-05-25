const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const emailToDemote = "anjali0804@gmail.com";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("MongoDB connection failed. Using local fallback database.");
    }
    try {
        const result = await User.updateOne({ email: emailToDemote }, { $set: { role: "user" } });

        if (result.matchedCount > 0) {
            console.log(`SUCCESS: Demoted ${emailToDemote} to USER.`);
        } else {
            console.log(`User ${emailToDemote} not found.`);
        }
    } catch (e) {
        console.error("Error demoting user:", e);
    }
    mongoose.connection.close();
}
run();
