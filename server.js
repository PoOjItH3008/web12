const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB Connected Successfully!");
}).catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
});

// ✅ Routes
app.use("/api", userRoutes); 
// Prefix API routes with /api

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚀 FamilyFound API is running!");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
