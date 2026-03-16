const joi = require("joi");

// User registration check
const userRegistrationCheckValidator = joi.object({
    email: joi.string().trim().lowercase().email().required().label("Email")
});

module.exports = { userRegistrationCheckValidator };