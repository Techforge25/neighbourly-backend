const { Router } = require("express");
const { fetchSuburbsForDropdown } = require("../controllers/suburbController");

// Router instance
const suburbRouter = Router();

// Fetch suburbs for dropdown
suburbRouter.route("/").get(fetchSuburbsForDropdown);

module.exports = suburbRouter;