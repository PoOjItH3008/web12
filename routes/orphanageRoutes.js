const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const PendingOrphanage = require("../models/PendingOrphanage");
const Orphanage = require("../models/Orphanage");

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'orphanages', // Folder in Cloudinary where images will be stored
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    }
});

// Set up multer to use CloudinaryStorage
const upload = multer({ storage: storage });

// Get all orphanages
router.get("/", async (req, res) => {
    try {
        const orphanages = await Orphanage.find();
        res.json(orphanages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Apply as Orphanage Route
router.post("/apply", upload.fields([{ name: "image" }, { name: "certificate" }]), async (req, res) => {
    try {
        console.log("🔍 Request Body:", req.body);
        console.log("📂 Uploaded Files:", req.files);

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: "Files not received" });
        }

        const { userId, name, email, contactNumber, address, description } = req.body;

        if (!userId || !name || !email || !contactNumber || !address || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const orphanageImage = req.files.image ? req.files.image[0].path : null;
        const certificateImage = req.files.certificate ? req.files.certificate[0].path : null;

        console.log("✅ Orphanage Image:", orphanageImage);
        console.log("✅ Certificate Image:", certificateImage);

        if (!orphanageImage || !certificateImage) {
            return res.status(400).json({ error: "Image and certificate are required" });
        }

        // ✅ Save to PendingOrphanages Collection
        const pendingOrphanage = new PendingOrphanage({
            name,
            email,
            contactNumber,
            address,
            description,
            image: orphanageImage,
            certificate: certificateImage,
            manager: userId, // Ensure `manager` field exists in the schema
        });

        await pendingOrphanage.save();

        res.status(201).json({ message: "Application submitted, pending approval", pendingOrphanage });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Get orphanages by location
router.get("/location/:place", async (req, res) => {
    try {
        const placeRegex = new RegExp(`^${req.params.place}$`, "i"); // Case-insensitive match
        const orphanages = await Orphanage.find({ place: placeRegex });
        res.json(orphanages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/pending/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if there is a pending orphanage application for the given userId
        const pendingApplication = await PendingOrphanage.findOne({ manager :userId });

        if (pendingApplication) {
            return res.status(200).json({ pending: true });
        } else {
            return res.status(200).json({ pending: false });
        }
    } catch (error) {
        console.error("❌ Error checking pending orphanages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/check/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if an orphanage exists where the user is the manager
        const orphanage = await Orphanage.findOne({ manager: userId });

        if (orphanage) {
            return res.status(200).json({ exists: true, orphanage });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking orphanage:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Add a new orphanage with image upload
router.post("/", upload.single("image"), async (req, res) => {
    try {
        // Check if the file is uploaded
        const imageUrl = req.file ? req.file.path : null;
        const registrationNumber = req.body.registrationNumber || undefined;

        // Parse orphans as an array of objects (ensure it's sent as JSON)
        const orphansArray = req.body.orphans ? JSON.parse(req.body.orphans) : [];

        // Prepare the new orphanage data
        const newOrphanage = new Orphanage({
            name: req.body.name,
            place: req.body.place,
            registrationNumber: registrationNumber, // Avoids saving `null`
            image: imageUrl,
            orphans: orphansArray
        });
        

        // Save the new orphanage to the database
        await newOrphanage.save();

        res.status(201).json(newOrphanage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
