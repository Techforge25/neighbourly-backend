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
    // Get validated payload
    const { clusterId, name, description } = validatePayload(createSuburbValidator, request.body);

    // Validate ID
    if(!isValidObjectId(clusterId)) throw new ApiError(400, "Invalid cluster ID");

    // Fetch
    const [exist, cluster, suburbCount] = await Promise.all([
        // Prevent name duplication
        // Suburb.exists({ name }),
        Suburb.exists({ name: { $regex: `^${name.trim()}$`, $options: "i" } }),

        // Find cluster
        Cluster.findById(clusterId).select("name").lean(),

        // Get count
        Suburb.countDocuments({ clusterId })
    ]);
    
    // Validate conditions
    if(exist) throw new ApiError(409, "The suburb with this name already exist");
    if(!cluster) throw new ApiError(404, "Cluster not found!");
    if(suburbCount >= 3) throw new ApiError(403, `${cluster.name} already have 3 suburbs`);

    // Save to db
    const suburb = await Suburb.create({ clusterId, name, description });
    if(!suburb) throw new ApiError(500, "Failed to add suburb");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Suburb has been created"));
});

// Fetch suburbs
const fetchSuburbs = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10 } = request.query;
    
    // Fetch
    const suburbs = await Suburb.aggregatePaginate([
        { $match:{} },

        // Lookup cluster
        {
            $lookup:{
                from: "clusters",
                localField: "clusterId",
                foreignField: "_id",
                as: "cluster"
            }
        },

        // Unwind
        { $unwind:{ path:"$cluster", preserveNullAndEmptyArrays:true } },

        // Sort
        { $sort:{ createdAt: -1 } },

        // Projection
        {
            $project:{
                name: 1,
                assignedCluster: "$cluster.name"
            }
        }
    ], { page, limit });
    if(!suburbs.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No suburbs found"));

    // Response
    return response.status(200).json(new ApiResponse(200, suburbs, "Suburbs have been fetched"));
});

// Update suburbs
const updateSuburb = asyncHandler(async (request, response) => {
    const { suburbId } = request.params;
    if(!isValidObjectId(suburbId)) throw new ApiError(400, "Invalid suburb ID");

    // Get validated payload
    const { clusterId, name, description } = validatePayload(createSuburbValidator, request.body);
    
    // Fetch
    const [suburb, cluster, suburbCount] = await Promise.all([
        // Prevent name duplication
        // Suburb.findOne({ name }),
        Suburb.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } }),

        // Find cluster
        Cluster.findById(clusterId).select("name").lean(),

        // Get count
        Suburb.countDocuments({ clusterId })
    ]);
    
    // Validate conditions
    if(suburb && String(suburb._id) !== String(suburbId)) throw new ApiError(409, "The suburb with this name already exist");
    if(!cluster) throw new ApiError(404, "Cluster not found!");
    if(suburbCount >= 3)
    {
        if(suburb && String(suburb.clusterId) !== String(clusterId))
        {
            throw new ApiError(403, `${cluster.name} already have 3 suburbs`);
        }
    }

    // Update
    const update = await Suburb.findByIdAndUpdate(suburbId, { $set:{ clusterId, name, description } }, { new:true });
    if(!update) throw new ApiError(400, "Failed to update suburb");

    // Response message
    let message = `Suburb has been updated`;
    if(suburb && String(clusterId) !== String(suburb.clusterId)) message += ` and assigned to ${cluster.name}`;    

    // Response
    return response.status(200).json(new ApiResponse(200, null, message));
});

// Delete suburbs
const deleteSuburb = asyncHandler(async (request, response) => {
    const { suburbId } = request.params;
    if(!isValidObjectId(suburbId)) throw new ApiError(400, "Invalid suburb ID");

    // Delete
    const suburb = await Suburb.findByIdAndDelete(suburbId);
    if(!suburb) throw new ApiError(404, "Suburb not found");

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Suburb has been deleted"))
});

module.exports = { createSuburb, fetchSuburbs, updateSuburb, deleteSuburb };