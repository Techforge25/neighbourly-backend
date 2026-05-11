const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { fetchDashboardStats, fetchTopRecommenderByCategory, fetchRecentPendingRecommendations } = require("../../controllers/admin/dashboardController");

// Router instance
const dashboardRouter = Router();

// Fetch dashboard stats
dashboardRouter.route("/stats").get(adminAuthentication, fetchDashboardStats);

// Fetch top recommender by category
dashboardRouter.route("/top-recommenders").get(adminAuthentication, fetchTopRecommenderByCategory);

// Fetch recent pending recommendations
dashboardRouter.route("/recent-pending").get(adminAuthentication, fetchRecentPendingRecommendations);

module.exports = dashboardRouter;