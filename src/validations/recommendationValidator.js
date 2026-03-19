const joi = require("joi");

// Create recommendation validator
const createRecommendationValidator = joi.object({
    // Basic info
    personName: joi.string().trim().min(3).max(30).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).required().label("Business name"),
    contact: joi.string().trim().max(15).pattern(/^\+?[1-9]\d{9,14}$/).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Contact"),
    serviceType: joi.string().trim().min(3).max(50).required().label("Service type"),
    location: joi.string().trim().min(10).max(200).required().label("Location"),

    // Other info
    website: joi.string().trim().uri().optional().allow(null, "").label("Website"),
    reasonsOfRecommendation: joi.array().items(joi.string()).min(1).max(3).required().label("Reasons of recommendation")
});

// Create recommendation with user info validator
const createRecommendationWithUserInfoValidator = joi.object({
    // User info
    fullName: joi.string().trim().min(3).max(30).required().label("User full name"),
    userContact: joi.string().trim().max(15).pattern(/^\+?[1-9]\d{9,14}$/).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("User contact"),
    userStreet: joi.string().trim().min(3).max(50).required().label("User street road"),
    userAddress: joi.string().trim().min(3).max(30).required().label("User address"),

    // Business info
    personName: joi.string().trim().min(3).max(30).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).required().label("Business name"),
    businessContact: joi.string().trim().max(15).pattern(/^\+?[1-9]\d{9,14}$/).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Business contact"),
    serviceType: joi.string().trim().min(3).max(50).required().label("Service type"),
    location: joi.string().trim().min(10).max(200).required().label("Location"),
    website: joi.string().trim().uri().optional().allow(null, "").label("Website"),
    reasonsOfRecommendation: joi.array().items(joi.string()).min(1).max(3).required().label("Reasons of recommendation")
});

module.exports = { createRecommendationValidator, createRecommendationWithUserInfoValidator };