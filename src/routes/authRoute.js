const { Router } = require("express");
const { userRegistrationCheck } = require("../controllers/authController");

// Router instance
const authRouter = Router();

// User registration check
authRouter.route("/user")
.post(userRegistrationCheck);

module.exports = authRouter;