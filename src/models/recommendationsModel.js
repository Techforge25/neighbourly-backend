const { Schema, model } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Schema
const recommendationSchema = new Schema({
    // References
    userId:{ type:Schema.Types.ObjectId, ref:"User" },
    businessId:{ type:Schema.Types.ObjectId, ref:"Business" },

    // Reason
    reasonsOfRecommendation:{ type:[String] },

    // Optional comments
    comment: { type:String, trim:true }
}, { timestamps:true });

// Pagination plugin
recommendationSchema.plugin(aggregatePaginate);

// Compound indexing
recommendationSchema.index({ userId: 1 });
recommendationSchema.index({ businessId: 1 });

// Model
const Recommendation = model("Recommendation", recommendationSchema);

module.exports = Recommendation;