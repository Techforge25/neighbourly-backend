const { Router } = require("express");
const { fetchSponsors, viewSponsor } = require("../controllers/admin/sponsorManagementController");

// Router instance
const sponsorRoute = Router();

// Fetch sponsors
sponsorRoute.route("/").get(fetchSponsors);

// Fetch sponsors
sponsorRoute.route("/:sponsorId").get(viewSponsor);

module.exports = sponsorRoute;