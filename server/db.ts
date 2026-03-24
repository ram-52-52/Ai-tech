import mongoose from "mongoose";
import * as schema from "../shared/schema";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set. MongoDB storage will be unavailable.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Keep Drizzle/Postgres placeholders for type safety/minimal breakage
export const pool = null as any;
export const db = null as any;
