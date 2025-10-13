import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String, required: true, trim: true },
    expirationDate: { type: Date },
    purchaseDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "consumed", "expired", "archived"],
      default: "active",
      index: true,
    },
    creationTime: { type: Date, default: Date.now },
  },
  { collection: "items" }
);

export default mongoose.model("Item", ItemSchema);
