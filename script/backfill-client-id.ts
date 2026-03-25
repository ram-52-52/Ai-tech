/**
 * One-time Backfill Script: Set clientId on all blogs that are missing it.
 *
 * Run with:
 *   npx tsx --env-file=.env script/backfill-client-id.ts
 */

import mongoose from "mongoose";

const PRIMARY_CLIENT_ID = "6acbc0de-d5b7-46cc-bf32-a1dc0b3faf59";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not set in environment.");
  process.exit(1);
}

async function backfill() {
  await mongoose.connect(MONGO_URI!);
  console.log("✅ Connected to MongoDB");

  // Target only blogs where clientId is null, undefined, or empty string
  const result = await mongoose.connection.collection("blogs").updateMany(
    { $or: [{ clientId: null }, { clientId: { $exists: false } }, { clientId: "" }] },
    { $set: { clientId: PRIMARY_CLIENT_ID } }
  );

  console.log(`✅ Backfill complete: ${result.modifiedCount} blog(s) updated with clientId = "${PRIMARY_CLIENT_ID}"`);
  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
