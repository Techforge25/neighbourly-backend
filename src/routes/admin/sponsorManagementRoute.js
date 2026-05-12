const { Router } = require("express");
const { adminAuthentication } = require("../../middlewares/adminAuth");
const { createSponsor, fetchSponsors, deleteSponsor, updateSponsor } = require("../../controllers/admin/sponsorManagementController");

// Router instance
const sponsorManagementRouter = Router();

// Create sponsor / Fetch sponsors
sponsorManagementRouter.route("/")
.post(adminAuthentication, createSponsor)
.get(adminAuthentication, fetchSponsors);

// Update / Delete sponsor
sponsorManagementRouter.route("/:sponsorId")
.patch(adminAuthentication, updateSponsor)
.delete(adminAuthentication, deleteSponsor);

module.exports = sponsorManagementRouter;