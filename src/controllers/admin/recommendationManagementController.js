const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const Recommendation = require("../../models/recommendationsModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const mongoose = require("mongoose");
const Business = require("../../models/businessModel");

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

// Delete recommendation
const deleteRecommendation = asyncHandler(async (request, response) => {
    const { recommendationId } = request.params;
    if(!isValidObjectId(recommendationId)) throw new ApiError(400, "Invalid Recommendation ID"); 
    
    // Start db session
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try
    {
        // Delete recommendation
        const recommendation = await Recommendation.findByIdAndDelete(recommendationId, { session:dbSession });
        if(!recommendation) throw new ApiError(404, "Recommendation not found");

        // Exclude count
        const business = await Business.findByIdAndUpdate(
            recommendation.businessId,
            { $inc:{ recommendationCount: -1 } },
            { new: true, session: dbSession }
        );

        // if(business && business.recommendationCount <= 0)
        // {
        //     console.log("Business count:", business?.recommendationCount);
        //     await Business.findByIdAndDelete(recommendation.businessId, { session: dbSession });
        // }           

        // Commit transaction
        await dbSession.commitTransaction();  
        
        // Delete business if count less than 1
        await Business.findOneAndDelete({ _id: recommendation.businessId, recommendationCount:{ $lte:0 } });      

        // Response
        return response.status(200).json(new ApiResponse(200, null, "Recommendation has been deleted"));        
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
});

module.exports = { fetchRecommendations, deleteRecommendation };