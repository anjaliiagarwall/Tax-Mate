const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config({ path: __dirname + "/.env" });

const emailToReset = "anjali0804@gmail.com";
const newPassword = "admin123";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("MongoDB connection failed. Using local fallback database.");
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password AND ensure role is admin
        const result = await User.updateOne(
            { email: emailToReset },
            { $set: { password: hashedPassword, role: "admin" } }
        );

        if (result.matchedCount > 0) {
            console.log(`SUCCESS: Password for ${emailToReset} reset to '${newPassword}' and role confirmed as ADMIN.`);
        } else {
            console.log(`User ${emailToReset} not found. Creating it now...`);
            const newUser = new User({
                name: "Default Admin",
                email: emailToReset,
                password: hashedPassword,
                role: "admin"
            });
            await newUser.save();
            console.log(`SUCCESS: Created new admin user ${emailToReset} with password '${newPassword}'.`);
        }
    } catch (e) {
        console.error("Error resetting password:", e);
    }
    mongoose.connection.close();
}
run();
