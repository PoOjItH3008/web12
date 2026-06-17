const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const OrphanageRoutes = require("./routes/orphanageRoutes");
const userRoutes = require("./routes/userRoutes");
const adminApprovalOrphanage = require("./routes/admin");
const orphanRoute = require("./routes/orphansRoute");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: "dcthupejo",
  api_key: "671314884392968",
  api_secret: "b0e_KH7FlaQ-OS8hj0wBXf6S_5Y",
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// ✅ Routes
app.use("/api", userRoutes);
app.use("/api/orphanages", OrphanageRoutes);
app.use("/api/admin", adminApprovalOrphanage);
app.use("/api/orphans", orphanRoute);
// Prefix API routes with /api

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 FamilyFound API is running!");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
