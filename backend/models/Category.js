import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    creationTime: { type: Date, default: Date.now },
  },
  { collection: "categories" }
);

export default mongoose.model("Category", CategorySchema);
