import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "customer" | "admin";

export interface IUser extends Document {
  username: string;
  password: string;
  phone: string;
  phoneVerified: boolean;
  role: UserRole;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    phoneVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("Users2", UserSchema, "users2");
