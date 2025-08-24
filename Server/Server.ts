// server.ts
import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// === middleware ===
app.use(cors({ origin: true, credentials: true })); // ← לאפשר לכל מקור
app.use(express.json());

// === routes ===
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// health
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running");
});

// === start server AFTER Mongo ===
(async () => {
  try {
    await connectDB();
    // ↓↓↓ להאזין לכל הכתובות, לא רק localhost
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Fatal: failed to connect DB. Server NOT started.", err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
