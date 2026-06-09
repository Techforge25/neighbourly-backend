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

// Fetch clusters
const fetchClusters = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10 } = request.query;

    // Fetch
    const cluster = await Cluster.aggregatePaginate([
        { $match:{ } },

        // Lookup suburb
        {
            $lookup:{
                from: "suburbs",
                localField: "_id",
                foreignField: "clusterId",
                as: "suburb",
                pipeline:[ { $project:{ _id:0, name:1 } } ]
            }
        },

        // Projection
        { $project:{ name: 1, suburbs: "$suburb.name" } }
    ], { page, limit });
    if(!cluster.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No clusters found"));

    // Response
    return response.status(200).json(new ApiResponse(200, cluster, "Clusters have been fetched"));
}); 

// Delete cluster
const deleteCluster = asyncHandler(async (request, response) => {
    const { clusterId } = request.params;
    if(!isValidObjectId(clusterId)) throw new ApiError(400, "Invalid Cluster ID");

    // Delete
    const cluster = await Cluster.findByIdAndDelete(clusterId);
    if(!cluster) throw new ApiError(404, "Cluster not found");

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Cluster has been deleted"));
});

module.exports = { createCluster, fetchClusters, deleteCluster };