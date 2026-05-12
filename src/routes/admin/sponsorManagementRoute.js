const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSponsor, fetchSponsors } = require("../../controllers/admin/sponsorManagementController");

// Router instance
const sponsorManagementRouter = Router();

// Create sponsor
sponsorManagementRouter.route("/")
.post(adminAuthentication, createSponsor)
.get(adminAuthentication, fetchSponsors);

module.exports = sponsorManagementRouter;