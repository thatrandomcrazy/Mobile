// config/db.ts
import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Grabbit";

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      // לא לשים directConnection/family כשזה Atlas!
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error; // נעיף למעלה כדי שהשרת לא יעלה אם DB לא מחובר
  }
};

export default connectDB;
