import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, updateInventory } from "../controllers/productController";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, requireAdmin, createProduct);
router.put("/:id", protect, requireAdmin, updateProduct);
router.patch("/:id/inventory", protect, requireAdmin, updateInventory);

export default router;
