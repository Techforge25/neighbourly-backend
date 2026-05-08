const { Schema, model } = require("mongoose");

// Schema
const sponsorSchema = new Schema({
    // Basic info
    logo: { type: String, trim: true, required: true },
    personName: { type: String, trim: true, required: true },

    // Area
    suburb: { type: String, trim: true, required: true }, // 3 sponsors allowed per area

    // Business info
    businessName: { type: String, trim: true, required: true },
    serviceType: { type: String, trim: true, required: true },
    contact: { type: String, trim: true, required: true },
});

// Model
const Sponsor = model("Sponsor", sponsorSchema);

module.exports = Sponsor;