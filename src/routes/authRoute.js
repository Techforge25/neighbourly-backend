const { Router } = require("express");
const { userRegistrationCheck, sendOTP, verifyOTP } = require("../controllers/authController");

// Router instance
const authRouter = Router();

// User registration check
authRouter.route("/user").post(userRegistrationCheck);

// Send OTP
authRouter.route("/user/send-otp").post(sendOTP);

// Verify OTP
authRouter.route("/user/verify-otp").post(verifyOTP);

module.exports = authRouter;