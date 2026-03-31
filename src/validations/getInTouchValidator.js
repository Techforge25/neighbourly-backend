const joi = require("joi");

// Patterns
const alphaPattern = /^[a-z A-Z]*$/;
const alphaNumericPattern = /^[a-zA-Z0-9 -]*$/;

// Send feedback validator
const sendFeedbackValidator = joi.object({
    fullName: joi.string().trim().min(3).max(40).pattern(alphaPattern).required().label("Full name"),
    email: joi.string().trim().lowercase().email().required().label("Email"),
    message: joi.string().trim().min(10).max(2000).required().label("Message")
});

module.exports = { sendFeedbackValidator };