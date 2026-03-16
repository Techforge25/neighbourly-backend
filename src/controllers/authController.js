const User = require("../models/userModel");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const { userRegistrationCheckValidator } = require("../validations/userValidator");

// User registration check
const userRegistrationCheck = asyncHandler(async (request, response) => {
    // Get validated payload
    const { email } = validatePayload(userRegistrationCheckValidator, request.body);

    // Check email
    const user = await User.findOne({ email }).select("email").lean();
    if(!user)
    {
        // Account creation required
        return response.status(200)
        .json(new ApiResponse(200, { email, accountCreationRequired:true }, "You need to create your account"));
    }

    // Response
    return response.status(200).json(new ApiResponse(200, { email:user.email, accountCreationRequired:false }, "You can see recommendations"));
});

module.exports = { userRegistrationCheck };