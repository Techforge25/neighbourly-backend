const { emptyList } = require("../../constants");
const Business = require("../../models/businessModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");

// Fetch all businesses
const fetchBusinesses = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10, trade, suburb, search } = request.query;

    // Base filter
    const filter = {};
    if(trade) filter.serviceType = trade;
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

module.exports = { fetchBusinesses };