const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { fetchBusinesses } = require("../../controllers/admin/businessManagementController");

// Router instance
const businessManagementRoute = Router();

// Fetch businesses
businessManagementRoute.route("/").get(adminAuthentication, fetchBusinesses);

module.exports = businessManagementRoute;