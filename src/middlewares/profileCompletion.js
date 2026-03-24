const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");

// Check profile completion (Whether user has given recommendation or not)
const checkProfileCompletion = asyncHandler(async (request, response, next) => {
    const userId = request.user._id;

    // Get user
    const user = await User.findById(userId).select("isProfileCompleted").lean();
    if(!user) throw new ApiError(404, "User not found or maybe deleted from db");

    // Pass
    request.user.isProfileCompleted = user.isProfileCompleted;
    return next();
});

// Prevent access of those who didn't give recommendation yet
const preventAccess = asyncHandler(async (request, response, next) => {
    if(!request.user.isProfileCompleted) throw new ApiError(403, "You need to give at least one recommendation to access this");
    return next();
});

module.exports = { checkProfileCompletion, preventAccess };