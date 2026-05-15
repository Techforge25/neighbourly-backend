const { Router } = require("express");
const { fetchSponsors } = require("../controllers/admin/sponsorManagementController");

// Router instance
const sponsorRoute = Router();

// Fetch sponsors
sponsorRoute.route("/").get(fetchSponsors);

module.exports = sponsorRoute;