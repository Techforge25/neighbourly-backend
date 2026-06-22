const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createCluster, fetchClusters, updateCluster, deleteCluster, 
fetchDropdownClusters } = require("../../controllers/admin/clusterManagementController");

// Router instance
const clusterManagementRoute = Router();

// Create / Fetch cluster
clusterManagementRoute.route("/")
.post(adminAuthentication, createCluster)
.get(adminAuthentication, fetchClusters);

// Fetch clusters for dropdown
clusterManagementRoute.route("/dropdown")
.get(adminAuthentication, fetchDropdownClusters);

// Update cluster
clusterManagementRoute.route("/:clusterId")
.put(adminAuthentication, updateCluster);
// .delete(adminAuthentication, deleteCluster);

module.exports = clusterManagementRoute;