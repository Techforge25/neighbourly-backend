const Business = require("../models/businessModel");
const Recommendation = require("../models/recommendationsModel");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const { createRecommendationValidator, createRecommendationWithUserInfoValidator } = require("../validations/recommendationValidator");

// Create recommendation
const createRecommendation = asyncHandler(async (request, response) => {
    // Get user
    const userId = request.user._id;
    const user = await User.findById(userId).select("_id isProfileCompleted").lean();
    if(!user) throw new ApiError(404, "User not found!");

    // Check profile completion
    if(!user.isProfileCompleted) throw new ApiError(400, "You cannot give recommendation without setting up your profile");

    // Get validated payload
    const { personName, businessName, contact, serviceType, location, 
    website, reasonsOfRecommendation } = validatePayload(createRecommendationValidator, request.body);

    // Find business
    let business = await Business.findOne({ businessName });
    if(!business)
    {
        business = await Business.create({ 
            personName, businessName, contact, serviceType, location,
            website, reasonsOfRecommendation
        });
        if(!business) throw new ApiError(500, "Failed to create business");
    }

    // Save to db
    const recommendation = await Recommendation.create({
        userId, personName, businessName, contact,
        serviceType, location, website, reasonsOfRecommendation
    });
    if(!recommendation) throw new ApiError(500, "Failed to create recommendation");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Recommendation has been created"));
});

// Create recommendation
const createRecommendationWithUserInfo = asyncHandler(async (request, response) => {
    // Get user
    const userId = request.user._id;
    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User not found!");

    // Get validated payload
    const { 
        // User info
        fullName, userContact, userStreet, userAddress,

        // Business info
        personName, businessName, businessContact, serviceType, location, website, reasonsOfRecommendation
    } = validatePayload(createRecommendationWithUserInfoValidator, request.body);

    // Save user
    if(!user.isProfileCompleted)
    {
        user.fullName = fullName;
        user.contact = userContact;
        user.streetName = userStreet;
        user.address = userAddress;
        user.isProfileCompleted = true;
        await user.save();
    }

    // Save recommendation
    const recommendation = await Recommendation.create({
        userId, personName, businessName, contact: businessContact,
        serviceType, location, website, reasonsOfRecommendation
    });
    if(!recommendation) throw new ApiError(500, "Failed to create recommendation with user info");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Recommendation has been created with user info"));
});

module.exports = { createRecommendation, createRecommendationWithUserInfo };