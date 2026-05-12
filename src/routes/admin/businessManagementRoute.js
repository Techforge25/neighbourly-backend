const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { fetchBusinesses, viewBusiness, deleteBusiness } = require("../../controllers/admin/businessManagementController");

// Router instance
const businessManagementRoute = Router();

// Fetch businesses
businessManagementRoute.route("/").get(adminAuthentication, fetchBusinesses);

// View business / Delete business
businessManagementRoute.route("/:businessId")
.get(adminAuthentication, viewBusiness)
.delete(adminAuthentication, deleteBusiness);

module.exports = businessManagementRoute;