const { isValidObjectId, default: mongoose } = require("mongoose");
const { emptyList } = require("../../constants");
const Business = require("../../models/businessModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const convertToMongoId = require("../../utils/convertToMongoId");
const validatePayload = require("../../utils/validatePayload");
const Recommendation = require("../../models/recommendationsModel");

// Fetch all businesses
const fetchBusinesses = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10, trade, suburb, search } = request.query;

    // Base filter
    const filter = { recommendationCount: { $gte: 1 } };
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

        // Sort
        { $sort:{ createdAt: -1 } },

        // Projection
        {
            $project: {
                _id: 1,
                personName: 1,
                businessName: 1,
                tradeCategory: "$serviceType",
                trustedIn: 1,
                trustPoints: 1,
                totalRecommendations: "$recommendationCount"
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

    // Fetch business
    const business = await Business.findById(businessId)
    .select("-_id businessName personName serviceType contact").lean();
    if(!business) throw new ApiError(404, "Business not found");

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

        // Only approved recommendations
        { $match: { "recommendations.status": "approved" } },        

        // Lookup users for each recommendation
        {
            $lookup: {
                from: "users",
                localField: "recommendations.userId",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    { $project: { _id:0, fullName: 1, email: 1, address: 1, contact:1 } }
                ]
            }
        },

        // Unwind user
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // Sort recommendations
        { $sort: { "recommendations.createdAt": -1 } },        

        // Group back all recommendations
        {
            $group: {
                _id: "$_id",
                recommendations: {
                    $push: {
                        user: "$user",
                        recommendationId: "$recommendations._id",
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
    if(!result)
    {
        return response.status(200)
        .json(new ApiResponse(200, { recommendations:[], business }, "No approved recommendations found for this business"));
    }

    // Response
    return response.status(200).json(new ApiResponse(200, { ...result, business }, "Business details fetched"));
});

// Delete business
const deleteBusiness = asyncHandler(async (request, response) => {
    const { businessId } = request.params;
    if(!isValidObjectId(businessId)) throw new ApiError(400, "Invalid business ID");

    // Start db session
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    try
    {
        // Delete business
        const business = await Business.findByIdAndDelete(businessId, { session: dbSession });
        if(!business) throw new ApiError(404, "Business not found");

        // Delete all related recommendations to this business
        const recommendation = await Recommendation.deleteMany({ businessId }, { session: dbSession });
    }
    catch(error)
    {
        await dbSession.abortTransaction();
        throw error;
    }
    finally
    {
        dbSession.endSession();
    }

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Business has been deleted"));
});

module.exports = { fetchBusinesses, viewBusiness, deleteBusiness };