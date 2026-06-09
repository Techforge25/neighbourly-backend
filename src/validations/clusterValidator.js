const joi = require("joi");

// Create cluster validator
const createClusterValidator = joi.object({
    name: joi.string().trim().min(2).max(50).required().label("Cluster"),
    description: joi.string().trim().optional().allow(null, "").max(2000).required().label("Description")
});

module.exports = { createClusterValidator };