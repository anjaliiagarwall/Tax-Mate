const express = require("express");
const User = require("../models/User");
const adminAuth = require("../middleware/adminMiddleware");

const router = express.Router();

// GET STATS
router.get("/stats", adminAuth, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ totalUsers: userCount });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET ALL USERS
router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE USER
router.delete("/users/:id", adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
