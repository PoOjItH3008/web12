const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ✅ Register User Route (POST /register)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ❌ Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" }); // 409 Conflict
    }

    // ✅ Save new user to the database (Plain password)
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" }); // 201 Created
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get All Users (GET /users)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Hide passwords in response
    res.json(users);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ User Login Route (POST /login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ Check password (Plain text)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
