const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const emailToCheck = "anjali0804@gmail.com";

console.log("Checking user role for:", emailToCheck);
console.log("URI:", process.env.MONGO_URI);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("MongoDB connection failed. Using local fallback database.");
    }
    try {
        const user = await User.findOne({ email: emailToCheck });

        if (user) {
            console.log("User found:");
            console.log("ID:", user._id);
            console.log("Email:", user.email);
            console.log("Role:", user.role);
            console.log("Password Hash:", user.password ? "Present" : "Missing");
        } else {
            console.log("User NOT found");
        }
    } catch (e) {
        console.error("Error debugging user:", e);
    }
    mongoose.connection.close();
}
run();
