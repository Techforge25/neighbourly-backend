const { Schema, model } = require("mongoose");

// Schema
const verifiedUserSchema = new Schema({
    userId: { type:Schema.Types.ObjectId, ref:"User", required:true, unique:true },
    expiresAt: { type:Date, default:Date.now, expires:"2m" }
}, { timestamps:true });

// Model
const VerifiedUser = model("VerifiedUser", verifiedUserSchema);

module.exports = VerifiedUser;