import { Request, Response } from "express";
import Product from "../models/Product";

export const getProducts = async (_req: Request, res: Response) => {
  const items = await Product.find({});
  res.json(items);
};

export const getProductById = async (req: Request, res: Response) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  const { delta, inventory } = req.body;
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    if (typeof inventory === "number") p.inventory = inventory;
    else if (typeof delta === "number") p.inventory = Math.max(0, p.inventory + delta);
    await p.save();
    res.json(p);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
