// controllers/orderController.ts
import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ userId: (req as any).user.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// POST /orders
export const createOrder = async (req: Request, res: Response) => {
  const { items, total } = req.body;

  if (!Array.isArray(items) || !items.length || typeof total !== "number") {
    return res.status(400).json({ message: "Items (array) and total (number) required" });
  }

  // נוודא שיש לכל פריט productId ו-qty
  for (const it of items) {
    if (!it?.id && !it?.productId) {
      return res.status(400).json({ message: "Each item must have productId" });
    }
    if (!it?.qty || it.qty <= 0) {
      return res.status(400).json({ message: "Each item must have qty > 0" });
    }
  }

  // התאמה לשמות מהפרונט שלך: id → productId
  const normalized = items.map((it: any) => ({
    productId: String(it.productId ?? it.id),
    title: String(it.title ?? ""),
    price: Number(it.price ?? 0),
    qty: Number(it.qty),
    image: it.image,
  }));

  try {
    // מפחיתים מלאי רק אם inventory >= qty
    const ops = normalized.map((it) => ({
      updateOne: {
        filter: { _id: it.productId, inventory: { $gte: it.qty } },
        update: { $inc: { inventory: -it.qty } },
      },
    }));

    const result = await Product.bulkWrite(ops, { ordered: true });
    const modified = result.modifiedCount ?? 0;

    if (modified !== normalized.length) {
      return res.status(409).json({ message: "Not enough stock for one or more items" });
    }

    // יוצרים הזמנה עם סנאפשוט נתונים
    const order = await Order.create({
      userId: (req as any).user.userId,
      items: normalized,
      total,
    });

    return res.status(201).json({ message: "Order created", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};
