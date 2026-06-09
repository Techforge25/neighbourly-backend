const { Schema, model } = require("mongoose");

// Schema
const suburbSchema = new Schema({
    clusterId: { type:Schema.Types.ObjectId, ref:"Cluster", required:true },
    name: { type:String, trim:true, required:true },
    description: { type:String, trim:true, default:null }
}, { timestamps: true });

// Model
const Suburb = model("Suburb", suburbSchema);

module.exports = Suburb;