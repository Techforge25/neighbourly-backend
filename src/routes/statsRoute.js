const { Router } = require("express");
const { fetchStats } = require("../controllers/statsController");

// Router instance
const statsRouter = Router();

// Fetch stats
statsRouter.route("/").get(fetchStats);

module.exports = statsRouter;