const { Schema, model } = require("mongoose");

// Schema
const clusterSchema = new Schema({
    name: { type:String, trim:true, required:true, unique:[true, "Cluster with this name has laready exist"] },
    description: { type:String, trim:true, default: null }
}, { timestamps: true });

// Model
const Cluster = model("Cluster", clusterSchema);

module.exports = Cluster;