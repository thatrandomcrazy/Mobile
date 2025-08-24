import express from "express";
import { getProducts, addProduct } from "../controllers/productController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, addProduct); // token required to add product

export default router;
