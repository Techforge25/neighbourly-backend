const { Router } = require("express");
const { userRegistrationCheck, verifyOTP, userAuthCheck } = require("../controllers/authController");
const { authentication } = require("../middlewares/auth");

// Router instance
const authRouter = Router();

// User registration check
authRouter.route("/user").post(userRegistrationCheck);

// Verify OTP
authRouter.route("/user/verify-otp").post(verifyOTP);

// User auth check
authRouter.route("/user/me").get(authentication, userAuthCheck);

module.exports = authRouter;