const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createCluster } = require("../../controllers/admin/clusterManagementController");

// Router instance
const clusterManagementRoute = Router();

// Create cluster
clusterManagementRoute.route("/").post(adminAuthentication, createCluster);

module.exports = clusterManagementRoute;