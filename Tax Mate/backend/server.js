const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
console.log("SERVER FILE LOADED");


// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const taxRoutes = require("./routes/taxRoutes.js");
const taxChatRoutes = require("./routes/taxChat");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/tax-chat", taxChatRoutes);
app.use("/api/admin", adminRoutes);



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected successfully"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err.message);
    console.warn("WARNING: Using local database fallback (JSON files under backend/data/).");
  });

// Test route
app.get("/", (req, res) => {
  res.send("Magical Tax Genie Backend Running");
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
