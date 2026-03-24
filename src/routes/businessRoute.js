const { Router } = require("express");
const { authentication } = require("../middlewares/auth");
const { viewBusiness } = require("../controllers/businessController");

// Router instance
const businessRouter = Router();

// View business
businessRouter.route("/:businessId").get(authentication, viewBusiness);

module.exports = businessRouter;