// src/routes/auth.ts
import express from "express";
import { register, login, sendOtp, verifyOtpLogin, verifyOtpRegister, me } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/otp/send", sendOtp);
router.post("/otp/verify-login", verifyOtpLogin);
router.post("/otp/verify-register", verifyOtpRegister);

export default router;
