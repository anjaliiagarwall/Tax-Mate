const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("MongoDB connection failed. Using local fallback database.");
    }
    try {
        const users = await User.find({}, "name email role");
        console.log("--- USERS IN DATABASE ---");
        console.table(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
    } catch (e) {
        console.error("Error reading users:", e);
    }
    mongoose.connection.close();
}
run();
