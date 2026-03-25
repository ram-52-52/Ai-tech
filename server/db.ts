import mongoose from "mongoose";
import * as schema from "../shared/schema";

const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(() => {}); // Silent fail — app continues with memory storage
}

// Keep Drizzle/Postgres placeholders for type safety/minimal breakage
export const pool = null as any;
export const db = null as any;
