const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createCluster, fetchClusters, deleteCluster } = require("../../controllers/admin/clusterManagementController");

// Router instance
const clusterManagementRoute = Router();

// Create cluster
clusterManagementRoute.route("/")
.post(adminAuthentication, createCluster)
.get(adminAuthentication, fetchClusters);

// Delete cluster
clusterManagementRoute.route("/:clusterId")
.delete(adminAuthentication, deleteCluster);

module.exports = clusterManagementRoute;