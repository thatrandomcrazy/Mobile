import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus = "pending" | "preparing" | "ready" | "on_the_way" | "picked_up";

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true, index: true },
  items: [
    {
      productId: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      qty: { type: Number, required: true, min: 1 },
      image: { type: String },
    },
  ],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "preparing", "ready", "on_the_way", "picked_up"], default: "pending", index: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>("Order", OrderSchema);
