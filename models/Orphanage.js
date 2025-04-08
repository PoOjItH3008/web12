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
      fullName: { type: String, required: true },
      gender: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      generalHealth: { type: String },
      vaccinationStatus: { type: String },
      medicalHistory: { type: String },
      familyStatus: { type: String },
      dateOfAdmission: { type: Date },
      previousLivingSituation: { type: String },
      languagesSpoken: [{ type: String }],
      hobbiesInterests: [{ type: String }],
      educationLevel: { type: String },
      eligibleForAdoption: { type: Boolean, default: false },
      countryRestrictions: { type: String },
      specialNeedsRequirements: { type: String },
      guardianContact: {
          name: { type: String },
          phone: { type: String }
      },
      profilePicture: { type: String },
      vaccinationReport: { type: String },
      legalAdoptionClearance: { type: String },
      documents: [{ type: String }], // Cloudinary URL for orphan
    },
  ],
});

const Orphanage = mongoose.model("Orphanage", orphanageSchema);

module.exports = Orphanage;
