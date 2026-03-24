const joi = require("joi");

// Patterns
const alphaPattern = /^[a-zA-Z]*$/;
const alphaNumericPattern = /^[a-zA-Z0-9 -]*$/;
const contactPattern = /^\+?[1-9]\d{9,14}$/;
const addressPattern = /^[a-zA-Z0-9 -,]*$/;

// Create recommendation validator
const createRecommendationValidator = joi.object({
    // Basic info
    personName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Business name"),
    contact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Contact"),
    serviceType: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Service type"),
    location: joi.string().trim().min(10).max(200).pattern(addressPattern).required().label("Location"),

    // Other info
    website: joi.string().trim().uri().optional().allow(null, "").label("Website"),
    reasonsOfRecommendation: joi.array().items(joi.string().pattern(alphaNumericPattern)).min(1).max(3).required().label("Reasons of recommendation")
});

// Create recommendation with user info validator
const createRecommendationWithUserInfoValidator = joi.object({
    // User info
    fullName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("User full name"),
    userContact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("User contact"),
    userStreet: joi.string().trim().min(3).max(50).pattern(addressPattern).required().label("User street road"),
    userAddress: joi.string().trim().min(3).max(30).pattern(addressPattern).required().label("User address"),

    // Business info
    personName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Business name"),
    businessContact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Business contact"),
    serviceType: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Service type"),
    location: joi.string().trim().min(10).max(200).pattern(addressPattern).required().label("Location"),
    website: joi.string().trim().uri().optional().allow(null, "").label("Website"),
    reasonsOfRecommendation: joi.array().items(joi.string().pattern(alphaNumericPattern)).min(1).max(3).required().label("Reasons of recommendation")
});

module.exports = { createRecommendationValidator, createRecommendationWithUserInfoValidator };