const { Schema, model } = require("mongoose");

// Schema
const verifiedUserSchema = new Schema({
    userId: { type:Schema.Types.ObjectId, ref:"User", required:true, unique:true },
    expiresAt: { type:Date, default: () => Date.now() + 2 * 60 * 1000 } // 2 minutes expiry
}, { timestamps:true });

// Index for automatic document expiration
verifiedUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Model
const VerifiedUser = model("VerifiedUser", verifiedUserSchema);

module.exports = VerifiedUser;