const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createCluster, fetchClusters, updateCluster, deleteCluster } = require("../../controllers/admin/clusterManagementController");

// Router instance
const clusterManagementRoute = Router();

// Create / Fetch cluster
clusterManagementRoute.route("/")
.post(adminAuthentication, createCluster)
.get(adminAuthentication, fetchClusters);

// Update / Delete cluster
clusterManagementRoute.route("/:clusterId")
.put(adminAuthentication, updateCluster)
.delete(adminAuthentication, deleteCluster);

module.exports = clusterManagementRoute;