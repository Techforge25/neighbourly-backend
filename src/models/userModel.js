const { Schema, model } = require("mongoose");

// Schema
const userSchema = new Schema({
    // Basic info
    fullName: { type:String, trim:true },
    email: { type:String, trim:true, lowercase:true, required:true, unique:[true, "This email has already been taken"] },
    contact: { type:String, trim:true, unique:[true, "This contact number is already taken"] },
    streetName: { type:String, trim:true },
    address: { type:String, trim:true },

    // Role and verification
    role: { type:String, enum:["user"], default:"user" },
    isVerified: { type:Boolean, default:false },

    // Account verification otp
    accountVerificationToken: { type:String, default:null },
    accountVerificationTokenExpires: { type:Date, default:null }  
}, { timestamps:true });

// Model
const User = model("User", userSchema);

module.exports = User;