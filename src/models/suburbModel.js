const { Schema, model } = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// Schema
const suburbSchema = new Schema({
    clusterId: { type:Schema.Types.ObjectId, ref:"Cluster", required:true },
    name: { type:String, trim:true, required:true, unique:[true, "Suburb with this name has already exist"] },
    description: { type:String, trim:true, default:null }
}, { timestamps: true });

// Add pagination plugin
suburbSchema.plugin(aggregatePaginate);

// Model
const Suburb = model("Suburb", suburbSchema);

module.exports = Suburb;