const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { fetchBusinesses, viewBusiness } = require("../../controllers/admin/businessManagementController");

// Router instance
const businessManagementRoute = Router();

// Fetch businesses
businessManagementRoute.route("/").get(adminAuthentication, fetchBusinesses);

// View business
businessManagementRoute.route("/:businessId").get(adminAuthentication, viewBusiness);

module.exports = businessManagementRoute;