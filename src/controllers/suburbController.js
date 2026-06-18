const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Suburb = require("../models/suburbModel");

// Fetch suburb
const fetchSuburbsForDropdown = asyncHandler(async (request, response) => {
    const suburbs = await Suburb.find({}).select("-_id name").sort({ name:1 }).lean();

    // Response
    return response.status(200).json(new ApiResponse(200, suburbs, "Available suburbs for dropdown option"));
});

module.exports = { fetchSuburbsForDropdown };