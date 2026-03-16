const { Schema, model } = require("mongoose");

// Schema
const userSchema = new Schema({
    fullName: { type:String, trim:true, required:true },
    email: { type:String, trim:true, lowercase:true, required:true, unique:[true, "This email has already been taken"] },
    contact: { type:String, trim:true, required:true, unique:[true, "This contact number is already taken"] },
    streetName: { type:String, trim:true, required:true },
    address: { type:String, trim:true, required:true },
}, { timestamps:true });

// Model
const User = model("User", userSchema);

module.exports = User;