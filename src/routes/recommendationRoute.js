const { Router } = require("express");
const { authentication, authCheck } = require("../middlewares/auth");
const { createRecommendation, createRecommendationWithUserInfo, 
fetchRecommendations, 
viewRecommendation} = require("../controllers/recommendationsController");

// Router instance
const recommendationRouter = Router();

// Create recommendation / Fetch recommendations
recommendationRouter.route("/")
.post(authentication, createRecommendation)
.get(authCheck, fetchRecommendations);

// Create recommendation with user info
recommendationRouter.route("/with-user-info")
.post(authentication, createRecommendationWithUserInfo);

// View recommendation
recommendationRouter.route("/:recommendationId")
.get(viewRecommendation);

module.exports = recommendationRouter;