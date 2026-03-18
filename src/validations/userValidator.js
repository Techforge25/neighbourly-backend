const joi = require("joi");

// User registration check
const userRegistrationCheckValidator = joi.object({
    email: joi.string().trim().lowercase().email().required().label("Email")
});

// Verify otp validator
const verifyOTPValidator = joi.object({
    email: joi.string().trim().lowercase().email().required().label("Email"),
    accountVerificationToken: joi.string().required().label("Verification code"),
});

module.exports = { userRegistrationCheckValidator, verifyOTPValidator };