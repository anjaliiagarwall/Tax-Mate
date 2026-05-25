const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const emailToPromote = "anjali0804@gmail.com";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("MongoDB connection failed. Using local fallback database.");
    }
    try {
        const result = await User.updateOne({ email: emailToPromote }, { $set: { role: "admin" } });

        if (result.modifiedCount > 0) {
            console.log(`SUCCESS: Promoted ${emailToPromote} to ADMIN.`);
        } else {
            console.log(`No changes made. User might not exist or is already admin.`);
        }
    } catch (e) {
        console.error("Error promoting user:", e);
    }
    mongoose.connection.close();
}
run();
