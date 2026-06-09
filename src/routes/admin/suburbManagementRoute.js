const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSuburb } = require("../../controllers/admin/suburbManagementController");

// Router instance
const suburbManagementRoute = Router();

// Create Suburbs
suburbManagementRoute.route("/:clusterId").post(adminAuthentication, createSuburb);

module.exports = suburbManagementRoute;