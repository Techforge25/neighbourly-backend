const { Schema, model } = require("mongoose");

// Schema
const userSchema = new Schema({
    // Basic info
    fullName: { type:String, trim:true, required:true },
    email: { type:String, trim:true, lowercase:true, required:true, unique:[true, "This email has already been taken"] },
    contact: { type:String, trim:true, required:true, unique:[true, "This contact number is already taken"] },
    streetName: { type:String, trim:true, required:true },
    address: { type:String, trim:true, required:true },
    status: { type:String, trim:true, enum:["pending", "approved"], default:"pending" },

    // Account verification otp
    accountVerificationToken: { type:String, default:null },
    accountVerificationTokenExpires: { type:Date, default:null },    
}, { timestamps:true });

// Model
const User = model("User", userSchema);

module.exports = User;