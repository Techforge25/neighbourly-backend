const { Router } = require("express");
const { fetchRecommendations } = require("../../controllers/admin/recommendationManagementController");
const { adminAuthentication } = require("../../middlewares/adminAuth");

// Router instance
const recommendationManagementRoute = Router();

// Fetch recommendations
recommendationManagementRoute.route("/").get(adminAuthentication, fetchRecommendations);

module.exports = recommendationManagementRoute;