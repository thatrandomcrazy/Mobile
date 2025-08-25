import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  price: number;
  image: string;
  inventory: number;
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  inventory: { type: Number, required: true, default: 0 },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
