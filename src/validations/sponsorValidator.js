const joi = require("joi");

// Patterns
const contactPattern = /^(?:\+?[1-9]\d{9,14}|0\d{9,14})$/;

// Create sponsor validator
const createSponsorValidator = joi.object({
    logo: joi.string().trim().uri().required().label("Sponsor logo"),
    personName: joi.string().trim().min(2).max(50).required().label("Person name"),
    businessName: joi.string().trim().min(2).max(100).required().label("Business name"),
    serviceType: joi.string().trim().min(2).max(50).required().label("Service type"),
    contact: joi.string().trim().max(15).pattern(contactPattern).required().messages({
        "string.pattern.base": "Contact number must be a valid Australian format (e.g., +923001234567)."
    }).label("Contact"),
    suburb: joi.string().trim().min(2).max(50).required().label("Suburb"),
});

// Update sponsor validator
const updateSponsorValidator = joi.object({
    logo: joi.string().trim().uri().label("Sponsor logo"),
    personName: joi.string().trim().min(2).max(50).label("Person name"),
    businessName: joi.string().trim().min(2).max(100).label("Business name"),
    contact: joi.string().trim().max(15).pattern(contactPattern).messages({
        "string.pattern.base": "Contact number must be a valid Australian format (e.g., +923001234567)."
    }).label("Contact")
});

module.exports = { createSponsorValidator, updateSponsorValidator };