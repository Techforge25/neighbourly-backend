const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const validatePayload = require("../utils/validatePayload");
const sendEmail = require("../service/email");
const { sendFeedbackValidator } = require("../validations/getInTouchValidator");

// Send feedback through email
const sendFeedback = asyncHandler(async (request, response) => {
    // Get validated payload
    const { fullName, email, message } = validatePayload(sendFeedbackValidator, request.body) || {};

    // Send email to admin
    const result = await sendEmail(process.env.GMAIL, "Feedback", 
    `You have received a new feedback from ${fullName} (${email}):\n\n${message}`
    );
    if(!result) throw new ApiError(500, "Failed to send feedback. Please try again later.");

    // Response
    return response.status(200).json(new ApiResponse(200, "Feedback sent successfully."));
}); 

module.exports = { sendFeedback };