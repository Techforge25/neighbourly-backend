const { Router } = require("express");
const { userRegistrationCheck, sendOTP, verifyOTP, refreshAccessToken, userAuthCheck } = require("../controllers/authController");
const { authentication } = require("../middlewares/auth");

// Router instance
const authRouter = Router();

// User registration check
authRouter.route("/user").post(userRegistrationCheck);

// Send OTP
authRouter.route("/user/send-otp").post(sendOTP);

// Verify OTP
authRouter.route("/user/verify-otp").post(verifyOTP);

// Refresh token
authRouter.route("/user/refreshToken").get(refreshAccessToken);

// User auth check
authRouter.route("/user/me").get(authentication, userAuthCheck);

module.exports = authRouter;