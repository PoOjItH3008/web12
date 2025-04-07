const mongoose = require("mongoose");

const orphanageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: String, required: true },
  registrationNumber: { type: String, required: true }, // Must be required when approved
  image: { type: String, required: false }, // Cloudinary URL for orphanage image
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Approved user
  orphans: [
    {
      name: { type: String, required: true },
      age: { type: String, required: true }, // Fixed: Number instead of String
      location: { type: String, default: "" }, // Default empty string for location
      image: { type: String, required: false }, // Cloudinary URL for orphan
    },
  ],
});

const Orphanage = mongoose.model("Orphanage", orphanageSchema);

module.exports = Orphanage;
