const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createCluster, fetchClusters, updateCluster, deleteCluster } = require("../../controllers/admin/clusterManagementController");

// Router instance
const clusterManagementRoute = Router();

// Create cluster
clusterManagementRoute.route("/")
.post(adminAuthentication, createCluster)
.get(adminAuthentication, fetchClusters);

// Delete cluster
clusterManagementRoute.route("/:clusterId")
.put(adminAuthentication, updateCluster)
.delete(adminAuthentication, deleteCluster);

module.exports = clusterManagementRoute;