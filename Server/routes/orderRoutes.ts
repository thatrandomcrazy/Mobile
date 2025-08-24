import express from "express";
import { getOrders, createOrder } from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getOrders); // token required
router.post("/", protect, createOrder); // token required

export default router;
