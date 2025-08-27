import { Request, Response } from "express";
import Order from "../models/Order";

// GET /orders (protected)
export const getOrders = async (req: Request, res: Response) => {
  try {
    // show only orders of the logged-in user
    const orders = await Order.find({ userId: (req as any).user.userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// POST /orders (protected)
export const createOrder = async (req: Request, res: Response) => {
  const { items, total } = req.body;

  if (!items || !total) {
    return res.status(400).json({ message: "Items and total required" });
  }

  try {
    const order = await Order.create({
      userId: (req as any).user.userId,
      items,
      total,
    });

    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
