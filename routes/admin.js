const express = require("express");
const PendingOrphanage = require("../models/PendingOrphanage");
const Orphanage = require("../models/Orphanage");

const router = express.Router();

// ✅ Approve Orphanage (Move to Approved Database)
router.post("/approve-orphanage/:id", async (req, res) => {
    try {
        const pendingOrphanage = await PendingOrphanage.findById(req.params.id);
        if (!pendingOrphanage) {
            return res.status(404).json({ error: "Pending orphanage not found" });
        }

        // Move orphanage to Approved Orphanages
        const newOrphanage = new Orphanage({
            name: pendingOrphanage.name,
            place: pendingOrphanage.address,
            registrationNumber: pendingOrphanage.certificate,
            image: pendingOrphanage.image,
            manager: pendingOrphanage.manager,
            orphans: [],
        });

        await newOrphanage.save();
        await PendingOrphanage.findByIdAndDelete(req.params.id); // Remove from Pending List

        res.json({ message: "Orphanage approved successfully", orphanageId: newOrphanage._id });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
