const { Router } = require("express");
const { userRegistrationCheck, sendOTP } = require("../controllers/authController");

// Router instance
const authRouter = Router();

// User registration check
authRouter.route("/user")
.post(userRegistrationCheck);

// Send OTP
authRouter.route("/user/send-otp")
.post(sendOTP);

module.exports = authRouter;