const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const { userRegistrationCheckValidator, verifyOTPValidator } = require("../validations/userValidator");
const { generateAccessToken } = require("../utils/accessToken");
const { cookieOptions } = require("../constants");
const generateCode = require("../utils/generateCode");
const sendEmail = require("../service/email");
const VerifiedUser = require("../models/verifiedUserModel");

// User registration check
const userRegistrationCheck = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body) || {};

    // Generate OTP token & expiry
    const { code:accountVerificationToken } = generateCode(6);
    const accountVerificationTokenExpires = Date.now() + 2 * 60 * 1000;
    // const accountVerificationTokenExpires = Date.now() + 65 * 1000;
    if(!accountVerificationToken) throw new ApiError(500, "Failed to generate OTP");      

    // Get user if exist
    let user = await User.findOne({ email }).select("fullName email role isVerified isProfileCompleted");
    if(user)
    {
        // Check if user is already verified
        const isVerified = await VerifiedUser.findOne({ userId:user._id });

        // Update user with new OTP token
        if(!isVerified || new Date(isVerified.expiresAt) < Date.now())
        {
            user.accountVerificationToken = accountVerificationToken;
            user.accountVerificationTokenExpires = accountVerificationTokenExpires;
            await user.save();
        }
        else
        {
            // Generate access token
            const accessToken = generateAccessToken({ _id: user._id, role: user.role });

            // Response
            return response.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json(new ApiResponse(200, { email, OTPRequired:false, isProfileCompleted:user.isProfileCompleted, accessToken }, "Authenticated"));
        }
    }
    else
    {
        // Create user with email
        user = await User.create({ 
            email,
            accountVerificationToken,
            accountVerificationTokenExpires
        });
        if(!user) throw new ApiError(500, "Failed to create user account");
    } 

    // Send email
    const result = await sendEmail(email, "OTP Token", 
    `<p>Your OTP Token is: <strong>${accountVerificationToken}</strong></p>
    <p>Please use this token to access your account.</p>`
    );
    if(!result) throw new ApiError(500, "Failed to send account activation token"); 
    
    // Response
    return response.status(200).json(new ApiResponse(200, 
        { email, OTPRequired:true, isProfileCompleted:user.isProfileCompleted }, 
        "We have sent you an OTP to your email"
    ));
});

// Verify OTP
const verifyOTP = asyncHandler(async (request, response) => {
    const { email, accountVerificationToken } = validatePayload(verifyOTPValidator, request.body) || {};

    // Find user
    const user = await User.findOne({ email });
    if(!user) throw new ApiError(404, "User not found! Incorrect email provided");

    // Verify otp token
    if(user.accountVerificationToken !== accountVerificationToken) throw new ApiError(400, "Invalid OTP");
    if(user.accountVerificationTokenExpires < Date.now()) throw new ApiError(400, "This OTP has been expired! Request new one");

    // Verify user
    const verifiedUser = await VerifiedUser.findOne({ userId:user._id });
    if(verifiedUser)
    {
        verifiedUser.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Extend expiry by 24 hours
        await verifiedUser.save();
    }
    else
    {
        await VerifiedUser.create({ userId:user._id });
    }
    
    // Generate access token
    const accessToken = generateAccessToken({ _id: user._id, role: user.role });

    // Save to db
    user.accountVerificationToken = null;
    user.accountVerificationTokenExpires = null;
    user.isVerified = true;    
    await user.save();

    // Response
    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { email, isProfileCompleted: user.isProfileCompleted, accessToken }, "Your account has been activated"));
});

// User auth check
const userAuthCheck = asyncHandler(async (request, response) => {
    const { _id:userId, role, accessToken } = request.user;

    // Response
    return response.status(200).json(new ApiResponse(200, { userId, role, accessToken }, "Authenticated!"));
});

module.exports = { userRegistrationCheck, verifyOTP, userAuthCheck };