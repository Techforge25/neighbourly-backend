const Sponsor = require("../../models/sponsorModel");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const validatePayload = require("../../utils/validatePayload");
const { createSponsorValidator } = require("../../validations/sponsorValidator");

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

module.exports = { createSponsor };