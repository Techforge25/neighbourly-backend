const generateCode = require("../../utils/generateCode");
const User = require("../models/userModel");
const sendEmail = require("../service/email");
const ApiError = require("./ApiError");

// Generate OTP
const generateOTP = async (email) => {
    try
    {
        if(!email) throw new ApiError(500, "Please provide email within 'generateOTP' method");

        // Generate OTP token
        const { code:accountVerificationToken } = generateCode(6);
        if(!accountVerificationToken) throw new ApiError(500, "Failed to generate OTP");     

        // Check email
        const user = await User.findOne({ email }).select("email isVerified accountVerificationToken accountVerificationTokenExpires");
        if(user)
        {
            // Already registered
            if(user.isVerified) throw new ApiError(400, "Cannot send OTP to already registered email");

            // Update user with new OTP token
            user.accountVerificationToken = accountVerificationToken;
            user.accountVerificationTokenExpires = Date.now() + 1 * 60 * 1000;
            await user.save();
        }
        else
        {
            // Create user with email
            const createUser = await User.create({ 
                email,
                accountVerificationToken,
                accountVerificationTokenExpires: Date.now() + 1 * 60 * 1000
            });
            if(!createUser) throw new ApiError(500, "Failed to create user account");
        } 

        // Send email
        const result = await sendEmail(email, "Account Activation Token", 
        `<p>Your OTP Token is: <strong>${accountVerificationToken}</strong></p>
        <p>Please use this token to activate your account.</p>`
        );
        if(!result) throw new ApiError(500, "Failed to send account activation token");     
    }
    catch(error)
    {
        throw error;
    }
};

module.exports = { generateOTP };