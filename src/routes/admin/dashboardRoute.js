const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { fetchDashboardStats } = require("../../controllers/admin/dashboardController");

// Router instance
const dashboardRouter = Router();

// Fetch dashboard stats
dashboardRouter.route("/stats").get(adminAuthentication, fetchDashboardStats);

module.exports = dashboardRouter;