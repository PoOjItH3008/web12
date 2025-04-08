const express = require("express");
const User = require("../models/User");
const Orphanage = require("../models/Orphanage");

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

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User Login Route (POST /login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user has an approved orphanage
    const orphanage = await Orphanage.findOne({ manager: user._id });
    if (!orphanage) {
      return res
        .status(403)
        .json({ error: "Access denied. Orphanage not approved." });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      orphanageId: orphanage._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
