// src/controllers/auth.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendVerification, checkVerification } from "../services/twilio";
import { toE164IL } from "../utils/phone";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ===== Username/Password (טלפון חובה) =====
export const register = async (req: Request, res: Response) => {
  const { name, password, phone } = req.body;

  // טלפון חובה לפי הבקשה שלך
  if (!name || !password || !phone) {
    return res.status(400).json({ message: "name, password and phone required" });
  }

  try {
    const formattedPhone = toE164IL(phone);

    // כפילות בשם משתמש
    const existingUser = await User.findOne({ username: name });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // כפילות במספר טלפון
    const existingPhoneUser = await User.findOne({ phone: formattedPhone });
    if (existingPhoneUser) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: name,
      password: hashedPassword,
      phone: formattedPhone,
      phoneVerified: false,
    });

    const token = jwt.sign(
      { userId: user._id, userName: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "user registered successfully",
      data: { name: user.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: "Name and password are required" });
  }

  try {
    const user = await User.findOne({ username: name });
    if (!user) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "logged in successfully",
      data: { name: user.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: (error as Error).message });
  }
};

// ===== Phone OTP =====

// POST /auth/otp/send  { phone: "05x-xxx-xxxx" }
export const sendOtp = async (req: Request, res: Response) => {
  try {
    if (!req.body.phone) return res.status(400).json({ message: "phone required" });
    const phone = toE164IL(req.body.phone);
    await sendVerification(phone, "sms");
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "send otp failed", error: (error as Error).message });
  }
};

// POST /auth/otp/verify-login  { phone, code }
export const verifyOtpLogin = async (req: Request, res: Response) => {
  const { phone: raw, code } = req.body;
  try {
    if (!raw || !code) return res.status(400).json({ message: "phone and code required" });
    const phone = toE164IL(raw);

    const check = await checkVerification(phone, code);
    if (check.status !== "approved") {
      return res.status(400).json({ message: "Invalid code" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found for this phone" });
    }

    if (!user.phoneVerified) {
      user.phoneVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "login by phone success", token });
  } catch (error) {
    res.status(500).json({ message: "verify otp login failed", error: (error as Error).message });
  }
};

// POST /auth/otp/verify-register  { phone, code, username, password? }
export const verifyOtpRegister = async (req: Request, res: Response) => {
  const { phone: raw, code, username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "username required" });
  }

  try {
    if (!raw || !code) return res.status(400).json({ message: "phone and code required" });
    const phone = toE164IL(raw);

    const check = await checkVerification(phone, code);
    if (check.status !== "approved") {
      return res.status(400).json({ message: "Invalid code" });
    }

    // אין כפילות בשם
    const existsByUsername = await User.findOne({ username });
    if (existsByUsername) {
      return res.status(400).json({ message: "username already taken" });
    }

    // חסימת כפילות לפי טלפון
    const existsByPhone = await User.findOne({ phone });
    if (existsByPhone) {
      return res.status(400).json({ message: "phone already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password || "phone_only_auth", salt);

    const user = await User.create({
      username,
      password: hashed,
      phone,
      phoneVerified: true,
    });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "registered by phone success",
      data: { name: user.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "verify otp register failed", error: (error as Error).message });
  }
};
