const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSuburb, fetchSuburbs } = require("../../controllers/admin/suburbManagementController");

// Router instance
const suburbManagementRoute = Router();

// Create Suburbs
suburbManagementRoute.route("/:clusterId")
.post(adminAuthentication, createSuburb);

// Fetch Suburbs
suburbManagementRoute.route("/")
.get(adminAuthentication, fetchSuburbs);

module.exports = suburbManagementRoute;