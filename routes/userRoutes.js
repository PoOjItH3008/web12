const express = require("express");
const User = require("../models/User");
const Orphanage = require("../models/Orphanage")
const Otp = require("../models/Otp");

const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await Otp.findOneAndUpdate(
      { email },
      {
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      },
      {
        upsert: true,
        new: true
      }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email });

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "OTP not found"
    });
  }

  if (record.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  res.json({
    success: true,
    message: "OTP verified"
  });
});

// ✅ Register User Route (POST /register)
router.post("/register", async (req, res) => {
  try {

    const {
      username,
      email,
      password,
      otp
    } = req.body;

    if (!username || !email || !password || !otp) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    const otpRecord =
      await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        error: "OTP not found"
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        error: "Invalid OTP"
      });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({
        error: "OTP expired"
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      isVerified: true
    });

    await newUser.save();

    await Otp.deleteOne({ email });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Internal Server Error"
    });
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

router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    const orphanage = await Orphanage.findOne({ manager: user._id });

    res.json({
      message: "Login successful",
      userId: user._id,
      orphanageId: orphanage ? orphanage._id : null,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
