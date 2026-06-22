const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSuburb, fetchSuburbs, updateSuburb, deleteSuburb } = require("../../controllers/admin/suburbManagementController");

// Router instance
const suburbManagementRoute = Router();

// Create / Fetch Suburbs
suburbManagementRoute.route("/")
.post(adminAuthentication, createSuburb)
.get(adminAuthentication, fetchSuburbs);

// Update suburb
suburbManagementRoute.route("/:suburbId")
.put(adminAuthentication, updateSuburb)
.delete(adminAuthentication, deleteSuburb);

module.exports = suburbManagementRoute;