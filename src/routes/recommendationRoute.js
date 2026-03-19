const { Router } = require("express");
const { authentication } = require("../middlewares/auth");
const { createRecommendation, createRecommendationWithUserInfo } = require("../controllers/recommendationsController");

// Router instance
const recommendationRouter = Router();

// Create recommendation
recommendationRouter.route("/")
.post(authentication, createRecommendation);

// Create recommendation with user info
recommendationRouter.route("/with-user-info")
.post(authentication, createRecommendationWithUserInfo);

module.exports = recommendationRouter;