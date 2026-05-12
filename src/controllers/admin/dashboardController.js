const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const Business = require("../../models/businessModel");
const Recommendation = require("../../models/recommendationsModel");
const Sponsor = require("../../models/sponsorModel");
const User = require("../../models/userModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const convertToMongoId = require("../../utils/convertToMongoId");

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
    const recentPendingRecommendations = await Recommendation.find({ status: "pending" })
    .populate([
        { path: "businessId", select: "businessName" },
        { path: "userId", select: "-_id address" },
    ])
    .sort({ createdAt: -1 }).limit(5).select("-_id -__v -createdAt -updatedAt -status -comment").lean();
    if(!recentPendingRecommendations.length) return response.status(200).json(new ApiResponse(200, emptyList, "No pending recommendations found"));

    // Response
    return response.status(200).json(new ApiResponse(200, recentPendingRecommendations, "Recent pending recommendations fetched successfully"));
});

// Fetch all pending recommendations
const fetchAllPendingRecommendations = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10, search, trade, suburb } = request.query;

    // Base filter
    const filter = { status: "pending" };

    // Filters
    if(trade) filter["business.serviceType"] = trade;
    if(suburb) filter["user.address"] = suburb;
    if(search) filter["business.personName"] = { $regex: search, $options: "i" };

    // Aggregation
    const pendingRecommendations = await Recommendation.aggregatePaginate([
        // Lookup business details
        { 
            $lookup: {
                from: "businesses",
                localField: "businessId",
                foreignField: "_id",
                as: "business"
            }
        },

        // Lookup user details
        { 
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },

        // Unwind business and user arrays
        { $unwind: "$business" },
        { $unwind: "$user" },

        // Match pending recommendations
        { $match: filter },

        // Projection
        { 
            $project: {
                businessId: "$business._id",
                businessName: "$business.businessName",
                personName: "$business.personName",
                tradeCategory: "$business.serviceType",
                suburb: "$user.address",
                submissionDate: "$createdAt",
                trustPoints: "$reasonsOfRecommendation"
            }
        }
    ], { page, limit })
    if(!pendingRecommendations.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No pending recommendations found"));

    // Response
    return response.status(200).json(new ApiResponse(200, pendingRecommendations, "All pending recommendations fetched successfully"));
});

// View business recommendation
const viewBusinessRecommendations = asyncHandler(async (request, response) => {
    const { businessId } = request.params;

    // Fetch
    const [result] = await Business.aggregate([
        // Match
        { $match: { _id: convertToMongoId(businessId) } },

        // Lookup recommendations
        {
            $lookup: {
                from: "recommendations",
                localField: "_id",
                foreignField: "businessId",
                as: "recommendations"
            }
        },

        // Unwind recommendations
        { $unwind: { path: "$recommendations", preserveNullAndEmptyArrays:true } },

        // Lookup users for each recommendation
        {
            $lookup: {
                from: "users",
                localField: "recommendations.userId",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    { $project: { _id:0, fullName: 1, email: 1, address: 1 } }
                ]
            }
        },

        // Unwind user
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // Group back all recommendations
        {
            $group: {
                _id: "$_id",
                personName: { $first: "$personName" },
                businessName: { $first: "$businessName" },
                serviceType: { $first: "$serviceType" },

                recommendations: {
                    $push: {
                        user: "$user",
                        reasonsOfRecommendation: "$recommendations.reasonsOfRecommendation",
                        comment: "$recommendations.comment",
                        createdAt: "$recommendations.createdAt"
                    }
                }
            }
        },

        // Projection
        { $project: { _id:0 } }
    ]);
    if(!result) return response.status(200).json(new ApiResponse(200, null, "No recommendations found for this business"));

    // Response
    return response.status(200).json(new ApiResponse(200, result, "Business recommendations fetched"));
});

// Approve / reject recommendation
const updateRecommendationStatus = asyncHandler(async (request, response) => {
    const { recommendationId } = request.params;
    const { status } = request.body || {};

    // Validate
    if(!isValidObjectId(recommendationId)) throw new ApiError(400, "Invalid recommendation ID");
    if(!status) throw new ApiError(400, "Status is required");
    if(!["approved", "rejected"].includes(status)) throw new ApiError(400, "Status must be either approved or rejected");

    // Find recommendation
    const recommendation = await Recommendation.findById(recommendationId);
    if(!recommendation) throw new ApiError(404, "Recommendation not found");

    // Validate
    if(recommendation.status !== "pending") throw new ApiError(400, "Only pending recommendations can be updated");

    // Save status
    recommendation.status = status;
    await recommendation.save();

    // Response message
    const message = status === "approved" ? "Recommendation has been approved" : "Recommendation has been rejected";

    // Response
    return response.status(200).json(new ApiResponse(200, { updatedStatus: recommendation.status }, message));
});

module.exports = { fetchDashboardStats, fetchTopRecommenderByCategory, fetchRecentPendingRecommendations, 
fetchAllPendingRecommendations, viewBusinessRecommendations, updateRecommendationStatus };