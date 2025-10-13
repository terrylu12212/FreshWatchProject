import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: mongoose.Schema.Types.Mixed, default: {} },
    results: { type: mongoose.Schema.Types.Mixed, default: {} },
    creationTime: { type: Date, default: Date.now },
  },
  { collection: "recipes" }
);

export default mongoose.model("Recipe", RecipeSchema);
