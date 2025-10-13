import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    remindDays: { type: Number, default: 0, min: 0 },
    channels: { type: [String], default: [] }, // like ['email', 'sms']
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    hashPassword: { type: String, required: true },
    name: { type: String, trim: true },
    settings: { type: SettingsSchema, default: () => ({}) },
    creationTime: { type: Date, default: Date.now },
  },
  { collection: "users", timestamps: false }
);

export default mongoose.model("User", UserSchema);
