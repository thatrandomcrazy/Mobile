// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;   // _id של המוצר
  title: string;
  price: number;       // מחיר ברגע הרכישה (סנאפשוט)
  qty: number;
  image?: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  total: number;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    title:      { type: String, required: true },
    price:      { type: Number, required: true, min: 0 },
    qty:        { type: Number, required: true, min: 1 },
    image:      { type: String }
  }],
  total: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>("Order", OrderSchema);
