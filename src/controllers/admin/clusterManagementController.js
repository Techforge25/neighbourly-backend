const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const Cluster = require("../../models/clusterModel");
const Suburb = require("../../models/suburbModel");
const { createClusterValidator } = require("../../validations/clusterValidator");

// Create cluster
const createCluster = asyncHandler(async (request, response) => {
    // Get validated payload
    const { name, description } = validatePayload(createClusterValidator, request.body);

    // Prevent name duplication
    const exist = await Cluster.exists({ name });
    if(exist) throw new ApiError(409, "The cluster with this name has already exist");
    
    // Save to db
    const cluster = await Cluster.create({ name, description });
    if(!cluster) throw new ApiError(500, "Failed to add cluster");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Cluster has been created"));
});

module.exports = { createCluster };