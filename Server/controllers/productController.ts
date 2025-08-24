import { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";

// GET /products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// POST /products (protected)
export const addProduct = async (req: Request, res: Response) => {
  const { title, price, image } = req.body;
  if (!title || !price || !image) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const product = await Product.create({ title, price, image });
    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
