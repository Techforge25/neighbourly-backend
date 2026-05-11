const { emptyList } = require("../../constants");
const Recommendation = require("../../models/recommendationsModel");
const Sponsor = require("../../models/sponsorModel");
const User = require("../../models/userModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// Fetch dashboard stats
const fetchDashboardStats = asyncHandler(async (request, response) => {
    const [totalPendingRecommendations, totalSponsors, totalRecommendations] = await Promise.all([
        Recommendation.countDocuments({ status: "pending" }),
        Sponsor.countDocuments(),
        Recommendation.countDocuments()
    ]);

    // Prepare payload
    const payload = { totalPendingRecommendations, totalSponsors, totalRecommendations };
    
    // Response
    return response.status(200).json(new ApiResponse(200, payload, "Dashboard stats fetched successfully"));
});

module.exports = { fetchDashboardStats };