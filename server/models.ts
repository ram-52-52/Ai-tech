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
    { returnDocument: 'after', upsert: true }
  );
  return sequenceDocument.seq;
}

// Blog Schema
const BlogSchema = new Schema({
  id: { type: Number, unique: true },
  clientId: { type: String, index: true }, // Tenant isolation: links blog to its ExternalSite
  title: { type: String, required: true },
  content: { type: String, required: true },
  topic: { type: String, required: true },
  slug: { type: String, required: true }, // Unique per-client, not globally
  metaDescription: { type: String },
  tags: { type: [String] },
  imageUrl: { type: String },
  featuredMediaProvider: { type: String },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Compound index: slug must be unique per client
BlogSchema.index({ clientId: 1, slug: 1 }, { unique: true, sparse: true });

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
  clientId: { type: String, index: true },
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
  id: { type: Number, required: true, unique: true },
  clientId: { type: String },
  blogId: { type: Number, required: true },
  siteId: { type: Number, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, default: "pending" },
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

// User Schema
const UserSchema = new Schema({
  id: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clientId: { type: String, required: true },
  role: { type: String, enum: ['user', 'superadmin'], default: 'user' },
  plan: { type: String, enum: ['Free Trial', 'Starter', 'Growth', 'Pro'], default: 'Free Trial' },
  blogsGeneratedThisMonth: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("userId");
  }
});

export const UserModel = mongoose.model("User", UserSchema);

// Log Schema
const LogSchema = new Schema({
  id: { type: Number, unique: true },
  userId: { type: Number },
  username: { type: String },
  action: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

LogSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("logId");
  }
});

export const LogModel = mongoose.model("Log", LogSchema);
// Plan Schema
const PlanSchema = new Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true },
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },
  blogLimit: { type: Number, required: true },
  features: { type: [String], default: [] },
  isMostPopular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

PlanSchema.pre("save", async function(this: any) {
  if (this.isNew && !this.id) {
    this.id = await getNextSequenceValue("planId");
  }
});

export const PlanModel = mongoose.model("Plan", PlanSchema);
