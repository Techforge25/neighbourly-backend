const { Router } = require("express");
const { fetchRecommendations, deleteRecommendation } = require("../../controllers/admin/recommendationManagementController");
const { adminAuthentication } = require("../../middlewares/adminAuth");

// Router instance
const recommendationManagementRoute = Router();

// Fetch recommendations
recommendationManagementRoute.route("/").get(adminAuthentication, fetchRecommendations);

// Delete recommendations
recommendationManagementRoute.route("/:recommendationId").delete(adminAuthentication, deleteRecommendation);

module.exports = recommendationManagementRoute;