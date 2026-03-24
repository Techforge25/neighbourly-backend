const Business = require("../models/businessModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const convertToMongoId = require("../utils/convertToMongoId");

// View business
const viewBusiness = asyncHandler(async (request, response) => {
    const { businessId } = request.params;

    // Get business
    const business = await Business.aggregate([
        // Match
        { $match:{ _id: convertToMongoId(businessId) } },

        // lookup inside user
        {
            $lookup:{
                from:"recommendations",
                localField:"_id",
                foreignField:"businessId",
                as:"recommendation",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"userId",
                            foreignField:"_id",
                            as: "users",
                            pipeline:[
                                {
                                    $project:{ fullName:1, email:1, address:1, createdAt:1 }
                                }
                            ]
                        }
                    }
                ]
            }
        },

        // Unwind
        { $unwind: "$recommendation" },

        // Projection
        {
            $project:{
                personName: 1,
                businessName: 1,
                website: 1,
                location: 1,
                users: "$recommendation.users"
            }
        }
    ]);
    if(!business[0]) throw new ApiError(404, "Business not found");

    // Response
    return response.status(200).json(new ApiResponse(200, business, "Business has been viewed"));
});

module.exports = { viewBusiness };