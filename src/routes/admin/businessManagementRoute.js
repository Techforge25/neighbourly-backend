const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");

// Router instance
const businessManagementRoute = Router();

// Fetch recommendations
businessManagementRoute.route("/").get(adminAuthentication);

module.exports = businessManagementRoute;