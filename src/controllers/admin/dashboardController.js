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

// Fetch top recommender by category
const fetchTopRecommenderByCategory = asyncHandler(async (request, response) => {
    // Aggregation pipeline to fetch top recommender by category
    const topRecommenders = await Recommendation.aggregate([
        { $match: { status: "approved" } },

        // Lookup business details
        {
            $lookup: {
                from: "businesses",
                localField: "businessId",
                foreignField: "_id",
                as: "business"
            }
        },

        // Unwind business array
        { $unwind: "$business" },

        // Group data
        { 
            $group: { 
                _id: "$business.serviceType", 
                count: { $sum: 1 },
                businessName: { $first: "$business.businessName" },
                personName: { $first: "$business.personName" },
                serviceType: { $first: "$business.serviceType" },
                recommendationCount: { $first: "$business.recommendationCount" }
            } 
        },

        // Sort
        { $sort: { count: -1 } },

        // Limit
        { $limit: 5 },

        // Projection
        { $project:{ _id: 0, count:0 } }
    ]);
    if(!topRecommenders.length) return response.status(200).json(new ApiResponse(200, emptyList, "No recommenders found"));

    // Response
    return response.status(200).json(new ApiResponse(200, topRecommenders, "Top recommenders fetched successfully"));
});

// Fetch recent pending recommendations
const fetchRecentPendingRecommendations = asyncHandler(async (request, response) => {
    const recentPendingRecommendations = await Recommendation.find({ status: "approved" })
    .populate([
        { path: "businessId", select: "businessName" },
        { path: "userId", select: "-_id address" },
    ])
    .sort({ createdAt: -1 }).limit(5).select("-_id -__v -createdAt -updatedAt -status -comment").lean();
    if(!recentPendingRecommendations.length) return response.status(200).json(new ApiResponse(200, emptyList, "No pending recommendations found"));

    // Response
    return response.status(200).json(new ApiResponse(200, recentPendingRecommendations, "Recent pending recommendations fetched successfully"));
});

module.exports = { fetchDashboardStats, fetchTopRecommenderByCategory, fetchRecentPendingRecommendations };