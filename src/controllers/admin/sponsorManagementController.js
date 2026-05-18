const { isValidObjectId } = require("mongoose");
const { emptyList } = require("../../constants");
const Sponsor = require("../../models/sponsorModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const { createSponsorValidator, updateSponsorValidator } = require("../../validations/sponsorValidator");

// Create sponsor
const createSponsor = asyncHandler(async (request, response) => {
    // Get validated payload
    const { logo, personName, businessName, serviceType, 
    contact, suburb } = validatePayload(createSponsorValidator, request.body) || {};

    // Find and prevent duplication
    const sponsor = await Sponsor.exists({ suburb, serviceType });
    if(sponsor) throw new ApiError(400, `The ${serviceType} is already exists in ${suburb}`);

    // Save to db
    const save = await Sponsor.create({ logo, personName, businessName, serviceType, contact, suburb });
    if(!save) throw new ApiError(500, "Failed to create sponsor");

    // Response
    return response.status(201).json(new ApiResponse(201, null, "Sponsor created"));
});

// Fetch sponsors
const fetchSponsors = asyncHandler(async (request, response) => {
    const { page = 1, limit = 10, suburb } = request.query;

    // Base filter
    const filter = {};
    if(!suburb) return response.status(200).json(new ApiResponse(200, emptyList, "No sponsors found"));
    filter.suburb = suburb;

    // Fetch
    const sponsors = await Sponsor.aggregatePaginate([
        // Match        
        { $match: filter },
        
        // Sort
        { $sort: { createdAt: -1 } },

        // Projection
        {
            $project:{
                personName: 1,
                businessName: 1,
                serviceType: 1,
                suburb: 1,
            }
        },        
    ], { page, limit });
    if(!sponsors.totalDocs) return response.status(200).json(new ApiResponse(200, emptyList, "No sponsors found in this suburb"));

    // Response
    return response.status(200).json(new ApiResponse(200, sponsors, "Sponsors fetched successfully"));
});

// View sponsor
const viewSponsor = asyncHandler(async (request, response) => {
    // Get sponsor id
    const { sponsorId } = request.params;
    if(!isValidObjectId(sponsorId)) throw new ApiError(400, "Invalid sponsor ID");

    // Get sponsor
    const sponsor = await Sponsor.findById(sponsorId).select("-_id -__v -updatedAt -createdAt").lean();
    if(!sponsor) throw new ApiError(404, "Sponsor not found");

    // Response
    return response.status(200).json(new ApiResponse(200, sponsor, "Sponsor has been fetched"));
});

// Update sponsor
const updateSponsor = asyncHandler(async (request, response) => {
    // Get sponsor id
    const { sponsorId } = request.params;
    if(!isValidObjectId(sponsorId)) throw new ApiError(400, "Invalid sponsor ID");

    const { logo, personName, businessName, contact } = validatePayload(updateSponsorValidator, request.body) || {};

    // Update
    const sponsor = await Sponsor.findByIdAndUpdate(
        sponsorId, 
        { $set: { logo, personName, businessName, contact } }, 
        { new: true }
    );
    if(!sponsor) throw new ApiError(404, "Sponsor not found");

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Sponsor updated successfully"));
});

// Delete sponsor
const deleteSponsor = asyncHandler(async (request, response) => {
    // Get sponsor id
    const { sponsorId } = request.params;
    if(!isValidObjectId(sponsorId)) throw new ApiError(400, "Invalid sponsor id");

    // Delete
    const sponsor = await Sponsor.findByIdAndDelete(sponsorId);
    if(!sponsor) throw new ApiError(404, "Sponsor not found");

    // Response
    return response.status(200).json(new ApiResponse(200, null, "Sponsor deleted successfully"));
});

module.exports = { createSponsor, fetchSponsors, viewSponsor, updateSponsor, deleteSponsor };