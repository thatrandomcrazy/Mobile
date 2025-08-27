// src/routes/auth.ts
import express from "express";
import {
  register,
  login,
  sendOtp,
  verifyOtpLogin,
  verifyOtpRegister,
} from "../controllers/authController"; // ← ודא שהשם תואם לקובץ הבקר שלך

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Phone OTP
router.post("/otp/send", sendOtp);
router.post("/otp/verify-login", verifyOtpLogin);
router.post("/otp/verify-register", verifyOtpRegister);

export default router;
