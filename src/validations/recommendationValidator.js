const joi = require("joi");

// Patterns
const alphaPattern = /^[a-z A-Z]*$/;
const alphaNumericPattern = /^[a-zA-Z0-9 -]*$/;
const contactPattern = /^(?:\+?[1-9]\d{9,14}|0\d{9,14})$/;
const addressPattern = /^[a-zA-Z0-9\s#.,-]*$/;

// Create recommendation validator
const createRecommendationValidator = joi.object({
    // Basic info
    personName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Business name"),
    contact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Contact"),
    serviceType: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Service type"),

    // Reason of recommendation
    reasonsOfRecommendation: joi.array().items(joi.string().pattern(/^[a-zA-Z0-9 -/]*$/)).min(1).max(3).required().label("Reasons of recommendation"),

    // Comments
    comment: joi.string().trim().optional().allow(null, "").default("-").label("Comment")
});

// Create recommendation with user info validator
const createRecommendationWithUserInfoValidator = joi.object({
    // User info
    fullName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("User full name"),
    userContact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("User contact"),
    userAddress: joi.string().trim().min(3).max(200).pattern(addressPattern).required().label("User address"),

    // Business info
    personName: joi.string().trim().min(3).max(30).pattern(alphaPattern).required().label("Person name"),
    businessName: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Business name"),
    businessContact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid international format (e.g., +923001234567)."
    }).label("Business contact"),
    serviceType: joi.string().trim().min(3).max(50).pattern(alphaPattern).required().label("Service type"),

    // Reason of recommendations
    reasonsOfRecommendation: joi.array().items(joi.string().pattern(/^[a-zA-Z0-9 -/]*$/)).min(1).max(3).required().label("Reasons of recommendation"),

    // Comments
    comment: joi.string().trim().optional().allow(null, "").default("-").label("Comment")    
});

module.exports = { createRecommendationValidator, createRecommendationWithUserInfoValidator };