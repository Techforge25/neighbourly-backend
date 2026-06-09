const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const { createSuburbValidator } = require("../../validations/suburbValidator");
const Cluster = require("../../models/clusterModel");
const Suburb = require("../../models/suburbModel");

// Create suburb
const createSuburb = asyncHandler(async (request, response) => {
    const { clusterId } = request.params;
    if(!isValidObjectId(clusterId)) throw new ApiError(400, "Invalid cluster ID");

    // Get validated payload
    const { name, description } = validatePayload(createSuburbValidator, request.body);

    const [exist, cluster, suburbCount] = await Promise.all([
        // Prevent name duplication
        Suburb.exists({ name }),

        // Find cluster
        Cluster.findById(clusterId).select("name").lean(),

        // Get count
        Suburb.countDocuments({ clusterId })
    ]);
    
    // Validate
    if(exist) throw new ApiError(409, "The suburb with this name has already exist");
    if(!cluster) throw new ApiError(404, "Cluster not found!");
    if(suburbCount >= 3) throw new ApiError(403, `${cluster.name} already have 3 suburbs`);

    // Save to db
    const suburb = await Suburb.create({ clusterId, name, description });
    if(!suburb) throw new ApiError(500, "Failed to add suburb");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Suburb has been created"));
});

module.exports = { createSuburb };