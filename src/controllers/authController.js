const generateCode = require("../../utils/generateCode");
const User = require("../models/userModel");
const sendEmail = require("../service/email");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const { userRegistrationCheckValidator } = require("../validations/userValidator");
const { generateAccessToken, generateRefreshToken, getRefreshToken, verifyRefreshToken } = require("../utils/accessToken");
const { cookieOptions } = require("../constants");

// User registration check
const userRegistrationCheck = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body) || {};

    // Check email
    const user = await User.findOne({ email }).select("email isVerified refreshToken");
    if(user)
    {
        if(!user.isVerified)
        {
            throw new ApiError(400, "Your account is not activated yet. Please verify your identity via OTP.");
        }
        else
        {
            // Generate access & refresh tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Save refresh token to db
            user.refreshToken = refreshToken;
            await user.save();

            // Response
            return response.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { email:user.email, accountCreationRequired:false }, "You can see recommendations"));
        }        
    }

    // Response
    return response.status(200).json(new ApiResponse(200, { email, accountCreationRequired:true }, "You need to create your account"));
});

// Send OTP
const sendOTP = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body) || {};

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

    // Response
    return response.status(200).json(new ApiResponse(200, null, "We have sent you an OTP to your email")); 
});

// Verify OTP
const verifyOTP = asyncHandler(async (request, response) => {
    const { accountVerificationToken } = request.body || {};

    // Find user
    const user = await User.findOne({ accountVerificationToken });
    if(!user) throw new ApiError(400, "Invalid OTP!");

    // Verify otp token
    if(user.accountVerificationTokenExpires < Date.now()) throw new ApiError(400, "This OTP has been expired! Request new one");

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);    

    // Save to db
    user.accountVerificationToken = null;
    user.accountVerificationTokenExpires = null;
    user.isVerified = true;
    user.refreshToken = refreshToken;
    await user.save();

    // Response
    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)    
    .json(new ApiResponse(200, user.email, "Your account has been activated"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (request, response) => {
    // Get token
    const token = getRefreshToken(request);
    if(!token) throw new ApiError(401, "Unauthorized! Refresh token is missing");

    // Verify refresh token
    const payload = verifyRefreshToken(token);
    if(!payload) throw new ApiError(401, "Unauthorized! Invalid refresh token");

    // Find user
    const user = await User.findById(payload._id).select("_id role refreshToken");
    if(!user) throw new ApiError(404, "User not found associated with the provided refresh token");

    // Compare tokens
    if(user.refreshToken !== token) throw new ApiError(400, "Refresh token mismatch");

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Validate
    if(!accessToken) throw new ApiError(400, "Failed to re-generate access token");
    if(!refreshToken) throw new ApiError(400, "Failed to re-generate refresh token");

    // Save to db
    user.refreshToken = refreshToken;
    await user.save();

    // Response
    return response.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, null, "Access & refresh tokens have been issued"));
});

// User auth check
const userAuthCheck = asyncHandler(async (request, response) => {
    const { _id:userId, role } = request.user;

    // Response
    return response.status(200).json(new ApiResponse(200, { userId, role }, "Authenticated!"));
});

module.exports = { userRegistrationCheck, sendOTP, verifyOTP, refreshAccessToken, userAuthCheck };