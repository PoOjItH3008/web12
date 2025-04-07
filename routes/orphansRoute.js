const express = require("express");
const mongoose = require("mongoose");
const Orphan = require("../models/Orphan");
const Orphanage = require("../models/Orphanage");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "orphans", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// Set up multer to use CloudinaryStorage
const upload = multer({ storage: storage });
// Add an orphan and link it to an orphanage

router.post(
  "/add",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "vaccinationReport", maxCount: 1 },
    { name: "legalAdoptionClearance", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { orphanageId, ...orphanData } = req.body;

      if (!mongoose.Types.ObjectId.isValid(orphanageId)) {
        return res.status(400).json({ message: "Invalid orphanage ID" });
      }

      // Handle file uploads
      orphanData.profilePicture = req.files["profilePicture"]
        ? req.files["profilePicture"][0].path
        : "";
      orphanData.vaccinationReport = req.files["vaccinationReport"]
        ? req.files["vaccinationReport"][0].path
        : "";
      orphanData.legalAdoptionClearance = req.files["legalAdoptionClearance"]
        ? req.files["legalAdoptionClearance"][0].path
        : "";
      orphanData.documents = req.files["documents"]
        ? req.files["documents"].map((file) => file.path)
        : [];

      const orphan = new Orphan(orphanData);
      await orphan.save();

      // Add orphan to orphanage
      const orphanDetails = {
        _id: orphan._id,
        name: orphan.fullName,
        age:
          new Date().getFullYear() - new Date(orphan.dateOfBirth).getFullYear(), // Calculate age
        location: orphan.nationality,
        image: orphan.profilePicture,
      };

      const orphanage = await Orphanage.findByIdAndUpdate(
        orphanageId,
        { $push: { orphans: orphanDetails } },
        { new: true }
      );

      if (!orphanage) {
        return res.status(404).json({ message: "Orphanage not found" });
      }

      res.status(201).json({ message: "Orphan added successfully", orphan });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Edit orphan details
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const orphan = await Orphan.findByIdAndUpdate(id, updates, { new: true });

    if (!orphan) {
      return res.status(404).json({ message: "Orphan not found" });
    }

    res.json({ message: "Orphan updated successfully", orphan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete orphan and remove from orphanage
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orphan = await Orphan.findByIdAndDelete(id);

    if (!orphan) {
      return res.status(404).json({ message: "Orphan not found" });
    }

    // Remove orphan from orphanage
    await Orphanage.updateMany({}, { $pull: { orphans: { _id: id } } });

    res.json({ message: "Orphan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get orphan details by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid orphan ID" });
    }

    const orphan = await Orphan.findById(id);

    if (!orphan) {
      return res.status(404).json({ message: "Orphan not found" });
    }

    res.json(orphan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;
