const mongoose = require("mongoose");

const orphanSchema = new mongoose.Schema({
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
    documents: [{ type: String }],
});

const Orphan = mongoose.model("Orphan", orphanSchema);

module.exports = Orphan;
