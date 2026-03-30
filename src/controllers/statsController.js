const Business = require("../models/businessModel");
const Recommendation = require("../models/recommendationsModel");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Fetch stats
const fetchStats = asyncHandler(async (request, response) => {
    // Fetch
    const [totalRecommendations, totalBusinesses] = await Promise.all([
        Recommendation.countDocuments({}),
        Business.countDocuments({ recommendationCount:{ $gte:3 } }),
    ]);

    // Prepare payload
    const payload = {
        recommendations: totalRecommendations || 0,
        businesses: totalBusinesses || 0
    };

    // Response
    return response.status(200).json(new ApiResponse(200, payload, "Stats has been fetched"));
});

module.exports = { fetchStats };