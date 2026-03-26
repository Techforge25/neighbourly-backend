const { Schema, model } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Schema
const businessSchema = new Schema({
    // Basic info
    personName: { type:String, trim:true, required:true },
    businessName: { type:String, trim:true, required:true, unique:[true, "This business name is already taken"] },
    email: { type:String, trim:true, unique:[true, "This business email is already taken"] },
    contact: { type:String, trim:true, required:true, unique:[true, "This business contact number has already been taken"] },
    serviceType: { type:String, trim:true, required:true },
    location: { type:String, trim:true, required:true },

    // Recommendation count
    recommendationCount: { type:Number, default:1 },

    // Optional comments
    comment: { type:String, trim:true }
});

// Pagination plugin
businessSchema.plugin(aggregatePaginate);

// Compund indexing
businessSchema.index({ personName: 1 });
businessSchema.index({ businessName: 1 });

// Model
const Business = model("Business", businessSchema);

module.exports = Business;