const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const Business = require("../../models/businessModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const convertToMongoId = require("../../utils/convertToMongoId");
const validatePayload = require("../../utils/validatePayload");

// Fetch all businesses
const fetchBusinesses = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10, trade, suburb, search } = request.query;

    // Base filter
    const filter = {};
    if(trade) filter.serviceType = trade.toLowerCase();
    if(suburb) filter["users.address"] = suburb;
    if(search) filter["businessName"] = { $regex: search, $options: "i" };    

    // Aggregation pipeline
    const businesses = await Business.aggregatePaginate([
        // Lookup recommendations
        {
            $lookup: {
                from: "recommendations",
                localField: "_id",
                foreignField: "businessId",
                as: "recommendations"
            }
        },

        // Lookup users from recommendations
        {
            $lookup: {
                from: "users",
                localField: "recommendations.userId",
                foreignField: "_id",
                as: "users"
            }
        },

        // Match
        { $match: filter },        

        // Add computed fields
        {
            $addFields: {
                // Total approved recommendations
                totalRecommendations: {
                    $size: {
                        $filter: {
                            input: "$recommendations",
                            as: "recommendation",
                            cond: {
                                $eq: ["$$recommendation.status", "approved"]
                            }
                        }
                    }
                },

                // Trusted in (addresses)
                trustedIn: {
                    $setUnion: [
                        {
                            $map: {
                                input: "$users",
                                as: "user",
                                in: "$$user.address"
                            }
                        },
                        []
                    ]
                },

                // Trust points
                trustPoints: {
                    $setUnion: [
                        {
                            $reduce: {
                                input: "$recommendations",
                                initialValue: [],
                                in: {
                                    $concatArrays: [
                                        "$$value",
                                        "$$this.reasonsOfRecommendation"
                                    ]
                                }
                            }
                        },
                        []
                    ]
                }
            }
        },

        // Projection
        {
            $project: {
                _id: 1,
                personName: 1,
                businessName: 1,
                tradeCategory: "$serviceType",
                trustedIn: 1,
                trustPoints: 1,
                totalRecommendations: 1
            }
        }
    ], { page, limit });
    if(!businesses.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No businesses found"));

    // Response
    return response.status(200).json(new ApiResponse(200, businesses, "Businesses fetched successfully"));
});

// View business
const viewBusiness = asyncHandler(async (request, response) => {
    const { businessId } = request.params;
    if(!isValidObjectId(businessId)) throw new ApiError(400, "Invalid business ID");

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
        { $project: { _id: 0 } }
    ]);
    if(!result) return response.status(200).json(new ApiResponse(200, null, "No business found for this ID"));

    // Response
    return response.status(200).json(new ApiResponse(200, result, "Business details fetched"));
});

// Delete business
const deleteBusiness = asyncHandler(async (request, response) => {
    const { businessId } = request.params;
    if(!isValidObjectId(businessId)) throw new ApiError(400, "Invalid business ID");

    // Delete
    const business = await Business.findByIdAndDelete(businessId);
    if(!business) throw new ApiError(404, "No business found");

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Business has been deleted"));
});

module.exports = { fetchBusinesses, viewBusiness, deleteBusiness };