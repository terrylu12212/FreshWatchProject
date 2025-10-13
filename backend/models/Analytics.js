import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    year: { type: Number, required: true, min: 1970 },
    month: { type: Number, required: true, min: 1, max: 12 },
    itemsAdded: { type: Number, default: 0, min: 0 },
    itemsExpired: { type: Number, default: 0, min: 0 },
    mostUsedCategory: { type: String, default: "" },
    leastUsedCategory: { type: String, default: "" },
  },
  { collection: "analytics" }
);

export default mongoose.model("Analytics", AnalyticsSchema);
