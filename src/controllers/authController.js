const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const { userRegistrationCheckValidator, verifyOTPValidator } = require("../validations/userValidator");
const { generateAccessToken } = require("../utils/accessToken");
const { cookieOptions } = require("../constants");
const { generateOTP } = require("../utils/generateOTP");

// User registration check
const userRegistrationCheck = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body) || {};

    // Get user
    const user = await User.findOne({ email }).select("email isVerified");
    if(!user)
    {
        return response.status(200)
        .json(new ApiResponse(200, { email, accountCreationRequired:true }, "You need to create your account"));
    }

    // If not verified
    if(!user.isVerified)
    {
        return response.status(200)
        .json(new ApiResponse(200, { email, accountCreationRequired:false }, "Your account is not activated yet. Please verify your identity via OTP."));
    }  

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Response
    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { email:user.email, accountCreationRequired:false }, "You can see recommendations"));   
});

// Send OTP
const sendOTP = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body) || {};

    // Generate OTP
    await generateOTP(email);

    // Response
    return response.status(200).json(new ApiResponse(200, email, "We have sent you an OTP to your email")); 
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

    // Save to db
    user.accountVerificationToken = null;
    user.accountVerificationTokenExpires = null;
    user.isVerified = true;
    await user.save();

    // User flag
    const isNewUser = Boolean(user.fullName);

    // Generate access token
    const accessToken = generateAccessToken(user);

    // Response
    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { email, isNewUser }, "Your account has been activated"));
});

// User auth check
const userAuthCheck = asyncHandler(async (request, response) => {
    const { _id:userId, role } = request.user;

    // Response
    return response.status(200).json(new ApiResponse(200, { userId, role }, "Authenticated!"));
});

module.exports = { userRegistrationCheck, sendOTP, verifyOTP, userAuthCheck };