const { Router } = require("express");
const { sendFeedback } = require("../controllers/getInTouchController");

// Router instance
const getInTouchRouter = Router();

// Send feedback
getInTouchRouter.route("/send-feedback").post(sendFeedback);

module.exports = getInTouchRouter;