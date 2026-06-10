const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSuburb, fetchSuburbs, deleteSuburbs } = require("../../controllers/admin/suburbManagementController");

// Router instance
const suburbManagementRoute = Router();

// Create Suburb
suburbManagementRoute.route("/:clusterId")
.post(adminAuthentication, createSuburb);

// Fetch Suburbs
suburbManagementRoute.route("/")
.get(adminAuthentication, fetchSuburbs);

// Delete Suburb
suburbManagementRoute.route("/:suburbId")
.delete(adminAuthentication, deleteSuburbs);

module.exports = suburbManagementRoute;