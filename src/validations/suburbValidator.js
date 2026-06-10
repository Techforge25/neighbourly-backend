const joi = require("joi");

// Create suburb validator
const createSuburbValidator = joi.object({
    clusterId: joi.string().trim().length(24).required().label("Cluster ID"),
    name: joi.string().trim().min(2).max(50).required().label("Suburb"),
    description: joi.string().trim().optional().allow(null, "").max(2000).required().label("Description")
});

module.exports = { createSuburbValidator };