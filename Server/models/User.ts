import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  phone: string;
  phoneVerified: boolean;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, 
    phoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("Users2", UserSchema, "users2");
