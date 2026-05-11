const { emptyList } = require("../../constants");
const Recommendation = require("../../models/recommendationsModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");

// Fetch recommendations
const fetchRecommendations = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10 } = request.query;

    // Fetch recommendations
    const recommendations = await Recommendation.aggregatePaginate([
        // Match
        { $match: { status: "approved" } },
    ], { page, limit });
    if(!recommendations.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No recommendations found"));

    // Response
    return response.status(200).json(new ApiResponse(200, recommendations, "Fetch recommendations"));
});

module.exports = { fetchRecommendations };