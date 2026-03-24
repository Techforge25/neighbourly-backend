const User = require("../models/userModel");
const { getAccessToken, verifyAccessToken } = require("../utils/accessToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Authentication
const authentication = asyncHandler(async (request, response, next) => {
    const accessToken = getAccessToken(request);
    if(!accessToken) throw new ApiError(401, "Unauthorized! Please verify your identity via OTP");

    // Verify
    const user = verifyAccessToken(accessToken);
    if(!user) throw new ApiError(401, "Invalid access token! Please verify your identity via OTP");

    // Check session expiry
    if(new Date(user.sessionExpires) < Date.now())
    {
        // Expire session
        const updateUser = await User.findByIdAndUpdate(
            user._id,
            { $set:{ isVerified:false } },
            { new:true }
        );
        if(!updateUser) throw new ApiError(404, "User not found! Failed to expire user session");
        throw new ApiError(403, "Your session has been expired! Please verify your identity via OTP")
    }

    // Pass through
    request.user = user;
    return next();
});

// Authorization based on role
const authorization = (roles = []) => {
    return (request, response, next) => {
        if(!request.user) throw new ApiError(401, "Login required!");
        if(!roles.includes(request.user?.role)) throw new ApiError(403, "Access denied");
        return next();
    }
};

// Soft auth check
const authCheck = asyncHandler((request, response, next) => {
    const accessToken = getAccessToken(request);
    if(accessToken)
    {
        // Verify
        const user = verifyAccessToken(accessToken);
        request.user = user || null;
    }

    return next();
});

module.exports = { authentication, authorization, authCheck };