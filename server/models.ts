import mongoose, { Schema, Document } from "mongoose";

// Counter Schema for numeric auto-increment
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
export const Counter = mongoose.model("Counter", CounterSchema);

export async function getNextSequenceValue(sequenceName: string) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

// Blog Schema
const BlogSchema = new Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  topic: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  metaDescription: { type: String },
  tags: { type: [String] },
  imageUrl: { type: String },
  featuredMediaProvider: { type: String },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

BlogSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("blogId");
  }
});

export const BlogModel = mongoose.model("Blog", BlogSchema);

// Trend Schema
const TrendSchema = new Schema({
  id: { type: Number, unique: true },
  topic: { type: String, required: true },
  volume: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

TrendSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("trendId");
  }
});

export const TrendModel = mongoose.model("Trend", TrendSchema);

// External Site Schema
const ExternalSiteSchema = new Schema({
  id: { type: Number, unique: true },
  clientId: { type: String, unique: true, sparse: true },
  siteName: { type: String, required: true },
  siteType: { type: String, required: true },
  siteUrl: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

ExternalSiteSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("siteId");
  }
});

export const ExternalSiteModel = mongoose.model("ExternalSite", ExternalSiteSchema);

// Scheduled Post Schema
const ScheduledPostSchema = new Schema({
  id: { type: Number, unique: true },
  blogId: { type: Number, required: true },
  siteId: { type: Number, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, default: "pending", required: true },
  postedAt: { type: Date },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

ScheduledPostSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("postId");
  }
});

export const ScheduledPostModel = mongoose.model("ScheduledPost", ScheduledPostSchema);
