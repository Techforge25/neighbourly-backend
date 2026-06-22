const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const Cluster = require("../../models/clusterModel");
const Suburb = require("../../models/suburbModel");
const { createClusterValidator, updateClusterValidator } = require("../../validations/clusterValidator");

// Create cluster
const createCluster = asyncHandler(async (request, response) => {
    // Get validated payload
    const { name, description } = validatePayload(createClusterValidator, request.body);

    // Prevent name duplication
    const exist = await Cluster.exists({ name: { $regex: `^${name.trim()}$`, $options: "i" } });
    if(exist) throw new ApiError(409, "The cluster with this name already exist");
    
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

        // Sort
        { $sort: { createdAt: -1 } },

        // Projection
        { $project:{ name: 1, suburbs: "$suburb.name" } }
    ], { page, limit });
    if(!cluster.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No clusters found"));

    // Response
    return response.status(200).json(new ApiResponse(200, cluster, "Clusters have been fetched"));
}); 

// Fetch dropdown clusters
const fetchDropdownClusters = asyncHandler(async (request, response) => {
    const clusters = await Cluster.find().select("name").sort("-createdAt").lean();

    // Response
    return response.status(200).json(new ApiResponse(200, clusters, "Available clusters for dropdown"));
});

// Update cluster
const updateCluster = asyncHandler(async (request, response) => {
    const { clusterId } = request.params;
    if(!isValidObjectId(clusterId)) throw new ApiError(400, "Invalid Cluster ID");

    // Get validated payload
    const { name, description } = validatePayload(updateClusterValidator, request.body);

    // Find cluster
    // const cluster = await Cluster.findOne({ name });
    const cluster = await Cluster.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } });

    // Prevent name duplication
    if(cluster && String(cluster._id) !== String(clusterId)) throw new ApiError(400, "The cluster with this name already exist");
    
    // Update
    const update = await Cluster.findByIdAndUpdate(clusterId, { $set:{ name, description } });
    if(!update) throw new ApiError(500, "Failed to update cluster");

    // Response
    return response.status(200).json(new ApiResponse(200, { name, description }, "Cluster has been updated"));
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

module.exports = { createCluster, fetchClusters, fetchDropdownClusters, updateCluster, deleteCluster };