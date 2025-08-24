import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const register = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "name and password required" });
  }

  try {
    const existingUser = await User.findOne({ username: name });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: name,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id, userName: user.username },
      "secret",
      { expiresIn: "1h" },
    );

    res.status(201).json({
      message: "user registered successfully",
      data: { name: user.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
      "secret",
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "logged in seccessfuly yamelech",
      data: { name: user.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
};
