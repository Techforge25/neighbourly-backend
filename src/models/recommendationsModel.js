const { Schema, model } = require("mongoose");

// Schema
const recommendationSchema = new Schema({
    // User reference
    userId:{ type:Schema.Types.ObjectId, ref:"User" },

    // Basic info
    personName: { type:String, trim:true, required:true },
    businessName: { type:String, trim:true, required:true },
    contact: { type:String, trim:true, required:true },
    serviceType: { type:String, trim:true, required:true },
    location: { type:String, trim:true, required:true },

    // Other info
    website: { type:String, trim:true },
    reasonsOfRecommendation:{ type:[String] }
}, { timestamps:true });

// Model
const Recommendation = model("Recommendation", recommendationSchema);

module.exports = Recommendation;