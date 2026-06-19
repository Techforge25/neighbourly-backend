const { emptyList } = require("../constants");
const Business = require("../models/businessModel");
const Recommendation = require("../models/recommendationsModel");
const Suburb = require("../models/suburbModel");
const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const convertToMongoId = require("../utils/convertToMongoId");
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
    const { personName, businessName, contact, serviceType, comment, 
    reasonsOfRecommendation } = validatePayload(createRecommendationValidator, request.body) || {};

    // Count todays recommendations
    const today = new Date();
    const todaysRecommendations = await Recommendation.countDocuments({
        userId,
        createdAt: {
            $gte: new Date(today.setHours(0,0,0,0)),
            $lte: new Date(today.setHours(23,59,59,999))
        }
    });
    if(Number(todaysRecommendations) >= 3) throw new ApiError(400, "You can submit only 3 recommendations per day");

    // Find business
    let business = await Business.findOne({ $or:[{ businessName }, { contact }] });
    if(!business)
    {
        // Create business (First recommendation for business)
        business = await Business.create({ personName, businessName, contact, serviceType });
        if(!business) throw new ApiError(500, "Failed to create business");
    }
    else
    {
        // Prevent multi-recommendations for each business by same user
        const recommendation = await Recommendation.findOne({ userId, businessId: business._id }).lean();
        if(recommendation) throw new ApiError(400, "You have already given a recommendation to this business");       
    }

    // Save to db
    const recommendation = await Recommendation.create({ userId, businessId: business._id, reasonsOfRecommendation, comment });
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
        fullName, userContact, userAddress,

        // Business info
        personName, businessName, businessContact, serviceType, 
        comment, reasonsOfRecommendation } = validatePayload(createRecommendationWithUserInfoValidator, request.body);

    // Check profile completion
    if(!user.isProfileCompleted)
    {
        // Prevent contact duplication for user
        const isExist = await User.findOne({ contact:userContact });
        if(isExist) throw new ApiError(400, `This '${userContact}' contact number is already been taken by another user!`);
    }

    // Find business
    let business = await Business.findOne({ $or:[{ businessName }, { contact:businessContact }] });
    if(!business)
    {
        // Create business (First recommendation for business)
        business = await Business.create({ personName, businessName, contact:businessContact, serviceType });
        if(!business) throw new ApiError(500, "Failed to create business");
    }
    else
    {
        // Prevent multi-recommendations for each business by same user
        const recommendation = await Recommendation.findOne({ userId, businessId: business._id }).lean();
        if(recommendation) throw new ApiError(400, "You have already given a recommendation to this business");           
    }    

    // Save recommendation
    const recommendation = await Recommendation.create({ userId, businessId: business._id, reasonsOfRecommendation, comment });
    if(!recommendation) throw new ApiError(500, "Failed to create recommendation with user info");

    // Save user info
    user.fullName = fullName;
    user.contact = userContact;
    user.address = userAddress;
    user.isProfileCompleted = true;
    await user.save();    

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Recommendation has been created with user info"));
});

// Fetch recommendations
// const fetchRecommendations = asyncHandler(async (request, response) => {
//     let { page = 1, limit = 6, filter, location } = request.query;

//     // Show list flag
//     let showFullList = true;

//     // // If not logged-in
//     // if(!request.user)
//     // {
//     //     page = 1;
//     //     limit = 3;
//     //     showFullList = false;
//     // }
//     // else
//     // {
//     //     // If not given any recommendation yet
//     //     const userId = request.user._id;
//     //     const user = await User.findOne({ _id:userId, isProfileCompleted:true }).select("isProfileCompleted").lean();
//     //     if(!user)
//     //     {
//     //         page = 1;
//     //         limit = 3;
//     //         showFullList = false;        
//     //     }
//     // }

//     // Base filter
//     const baseFilter = { status: "approved" };
//     if(filter) baseFilter["business.serviceType"] = { $regex: filter, $options: "i" };

//     // Aggregation
//     const aggregation = Recommendation.aggregate([
//         // Lookup business
//         {
//             $lookup: {
//                 from: "businesses",
//                 localField: "businessId",
//                 foreignField: "_id",
//                 as: "business"
//             }
//         },

//         // Lookup user
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "userId",
//                 foreignField: "_id",
//                 as: "user"
//             }
//         },

//         // Unwind
//         { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
//         { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

//         // Match approved + service filter
//         {
//             $match: {
//                 ...baseFilter,
//                 "business.recommendationCount": { $gte: 3 }
//             }
//         },

//         // Group by business
//         {
//             $group: {
//                 _id: "$business._id",
//                 businessId: { $first: "$business._id" },
//                 personName: { $first: "$business.personName" },
//                 businessName: { $first: "$business.businessName" },
//                 businessContact: { $first: "$business.contact" },
//                 serviceType: { $first: "$business.serviceType" },

//                 // IMPORTANT
//                 addresses: { $addToSet: "$user.address" },
//                 recommendationCount: {
//                     $sum: {
//                         $cond: [
//                             location
//                                 ? { $eq: ["$user.address", location] }
//                                 : true,
//                             1,
//                             0
//                         ]
//                     }
//                 },
//                 reasonsOfRecommendation: { $push: "$reasonsOfRecommendation" },
//                 createdAt: { $first: "$business.createdAt" }
//             }
//         },

//         // FILTER AFTER GROUPING
//         ...(location
//             ? [
//                 {
//                     $match: {
//                         recommendationCount: { $gt: 0 }
//                     }
//                 }
//             ]
//             : []),        

//         // Sort
//         { $sort: { recommendationCount: -1, createdAt: -1, businessId: 1 } },

//         // Project
//         { $project: { _id: 0, createdAt: 0 } }
//     ]);       

//     // Execute query with pagination
//     const recommendations = await Recommendation.aggregatePaginate(aggregation, { page, limit });
//     if(!recommendations.docs.length) return response.status(200).json(new ApiResponse(200, { ...emptyList, showFullList }, "No recommendations found"));

//     // Response
//     return response.status(200).json(new ApiResponse(200, { recommendations, showFullList }, "Recommendations have been fetched"));
// });

// Fetch recommendation (Update V2)
// const fetchRecommendations = asyncHandler(async (request, response) => {
//     let { page = 1, limit = 6, filter, location } = request.query;

//     // Show list flag
//     let showFullList = true;

//     // Get all suburbs belonging to the selected suburb's cluster
//     let clusterSuburbs = [];

//     if(location) 
//     {
//         // Find suburb
//         const suburb = await Suburb.findOne({ name: location }).select("clusterId").lean();
//         if(!suburb) throw new ApiError(404, "No suburb found associated with this name");
//         clusterSuburbs = await Suburb.find({ clusterId: suburb.clusterId }).distinct("name");
//     }

//     // Base filter
//     const baseFilter = { status: "approved" };
//     if(filter) baseFilter["business.serviceType"] = { $regex: filter, $options: "i" };
    
//     // Aggregation
//     const recommendations = await Recommendation.aggregatePaginate([
//         // Business lookup
//         {
//             $lookup: {
//                 from: "businesses",
//                 localField: "businessId",
//                 foreignField: "_id",
//                 as: "business"
//             }
//         },

//         // User lookup
//         {
//             $lookup: {
//                 from: "users",
//                 localField: "userId",
//                 foreignField: "_id",
//                 as: "user"
//             }
//         },

//         // Unwind
//         { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
//         { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

//         // Match approved recommendations
//         { $match: { ...baseFilter, "business.recommendationCount": { $gte: 3 } } },

//         // Group by business
//         {
//             $group: {
//                 _id: "$business._id",

//                 businessId: { $first: "$business._id" },
//                 personName: { $first: "$business.personName" },
//                 businessName: { $first: "$business.businessName" },
//                 businessContact: { $first: "$business.contact" },
//                 serviceType: { $first: "$business.serviceType" },
//                 addresses: { $addToSet: "$user.address" },

//                 // Recommendation count
//                 recommendationCount: {
//                     $sum: {
//                         $cond: [
//                             location
//                                 ? 
//                                 { $in: ["$user.address", clusterSuburbs] }
//                                 : true,
//                             1,
//                             0
//                         ]
//                     }
//                 },

//                 reasonsOfRecommendation: { $push: "$reasonsOfRecommendation" },
//                 createdAt: { $first: "$business.createdAt" }
//             }
//         },

//         // When location selected, only show businesses
//         // having recommendations from that cluster
//         ...(location
//             ? [
//                   {
//                       $match: {
//                           recommendationCount: { $gt: 0 }
//                       }
//                   }
//               ]
//             : []),

//         // Sort
//         { $sort: { recommendationCount: -1, createdAt: -1, businessId: 1 } },

//         // Final projection
//         { $project: { _id: 0, createdAt: 0 } }
//     ], { page, limit });
//     if(!recommendations.totalDocs) return response.status(200).json(new ApiResponse(200, { ...emptyList, showFullList },"No recommendations found"));
    
//     // Response
//     return response.status(200).json(new ApiResponse(200, { recommendations, showFullList }, "Recommendations have been fetched"));
// });

// Fetch recommendation (Update V3)
const fetchRecommendations = asyncHandler(async (request, response) => {
    let { page = 1, limit = 6, filter, location } = request.query;

    // Show list flag
    let showFullList = true;

    // Get all suburbs belonging to the selected suburb's cluster
    let clusterSuburbs = [];

    if(location) 
    {
        // Find suburb
        const suburb = await Suburb.findOne({ name: location }).select("clusterId").lean();
        if(!suburb) throw new ApiError(404, "No suburb found associated with this name");

        clusterSuburbs = await Suburb.find({ clusterId: suburb.clusterId }).distinct("name");
    }

    // Base filter
    const baseFilter = { status: "approved" };
    if(filter) baseFilter["business.serviceType"] = { $regex: filter, $options: "i" };

    // Aggregation
    const recommendations = await Recommendation.aggregatePaginate([
        // Business lookup
        {
            $lookup: {
                from: "businesses",
                localField: "businessId",
                foreignField: "_id",
                as: "business"
            }
        },

        // User lookup
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },

        // Unwind
        { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

        // Match approved recommendations
        { $match: baseFilter },

        // Group by business
        {
            $group: {
                _id: "$business._id",

                businessId: { $first: "$business._id" },
                personName: { $first: "$business.personName" },
                businessName: { $first: "$business.businessName" },
                businessContact: { $first: "$business.contact" },
                serviceType: { $first: "$business.serviceType" },
                addresses: { $addToSet: "$user.address" },

                // Total recommendations for business
                totalRecommendationCount: { $sum: 1 },

                // Recommendations from selected cluster
                clusterRecommendationCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: [location, null] },
                                    { $in: ["$user.address", clusterSuburbs] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },

                reasonsOfRecommendation: { $push: "$reasonsOfRecommendation" },
                createdAt: { $first: "$business.createdAt" }
            }
        },

        // Use cluster count when location selected otherwise total count
        {
            $addFields: {
                recommendationCount: location
                    ? "$clusterRecommendationCount"
                    : "$totalRecommendationCount"
            }
        },

        // Only show businesses having at least 3 recommendations
        { $match: { recommendationCount: { $gte: 3 } } },

        // Sort
        { $sort: { recommendationCount: -1, createdAt: -1, businessId: 1 } },

        // Final projection
        {
            $project: {
                _id: 0,
                createdAt: 0,
                totalRecommendationCount: 0,
                clusterRecommendationCount: 0
            }
        }
    ], { page, limit });
    if(!recommendations.totalDocs) return response.status(200).json(new ApiResponse(200, { ...emptyList, showFullList }, "No recommendations found"));

    // Response
    return response.status(200).json(new ApiResponse(200, { recommendations, showFullList }, "Recommendations have been fetched"));
});

module.exports = { createRecommendation, createRecommendationWithUserInfo, fetchRecommendations };