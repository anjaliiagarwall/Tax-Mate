const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-assign admin role if email starts with "admin" (Simple logic for demo)
    const role = email.startsWith("admin") ? "admin" : "user";

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role || "user", message: "Login successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// GUEST LOGIN
router.post("/guest-login", async (req, res) => {
  try {
    // Generate a temporary guest ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const token = jwt.sign(
      {
        id: guestId,
        email: "guest@taxgenie.local",
        isGuest: true
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, message: "Welcome Guest!" });

  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware for protected routes
const auth = require("../middleware/authMiddleware");

// GET USER PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// CHANGE PASSWORD
router.post("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE ACCOUNT
router.delete("/delete-account", auth, async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user.id);

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
