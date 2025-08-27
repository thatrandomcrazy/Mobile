// src/routes/orderRoutes.ts
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { adminOnly } from "../middleware/requireRole";
import {
  getOrders,
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

router.get("/", protect, getOrders);
router.post("/", protect, createOrder);

router.get("/admin", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
