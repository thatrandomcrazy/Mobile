import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";

const ALLOWED = ["pending", "preparing", "ready", "on_the_way", "picked_up"];

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { items, total } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Items must be a non-empty array" });

    const normalized = items.map((it: any) => ({
      productId: String(it.productId ?? it.id ?? "").trim(),
      title: String(it.title ?? "").trim(),
      price: Number(it.price ?? NaN),
      qty: Number(it.qty ?? NaN),
      image: it.image ? String(it.image) : undefined,
    }));

    for (const it of normalized) {
      if (!it.productId || !it.title || !Number.isFinite(it.price) || it.price < 0 || !Number.isInteger(it.qty) || it.qty <= 0) {
        return res.status(400).json({ message: "Invalid item" });
      }
    }

    const serverTotal = Number(normalized.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2));
    if (total !== undefined && total !== null) {
      const clientTotal = Number(total);
      if (!Number.isFinite(clientTotal) || Math.abs(clientTotal - serverTotal) > 0.05) {
        return res.status(400).json({ message: "Total mismatch" });
      }
    }

    const decremented: Array<{ productId: string; qty: number }> = [];
    for (const it of normalized) {
      const r = await Product.updateOne({ _id: it.productId, inventory: { $gte: it.qty } }, { $inc: { inventory: -it.qty } });
      if (!r.matchedCount) {
        for (const d of decremented) await Product.updateOne({ _id: d.productId }, { $inc: { inventory: d.qty } });
        return res.status(409).json({ message: `Not enough stock for "${it.title}"` });
      }
      decremented.push({ productId: it.productId, qty: it.qty });
    }

    const order = await Order.create({ userId, items: normalized, total: serverTotal, status: "pending" });
    return res.status(201).json({ message: "Order created", order });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const q: any = {};
    if (status) q.status = status;
    const orders = await Order.find(q).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!ALLOWED.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(order);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
