import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemID: { type: mongoose.Schema.Types.ObjectId, ref: "Item", index: true },
    channel: { type: String, enum: ["email", "sms", "push", "webhook"], required: true },
    status: { type: String, enum: ["queued", "sent", "failed", "cancelled"], default: "queued" },
    message_header: { type: String, default: "" },
    message_body: { type: String, default: "" },
    sendDate: { type: Date },
    creationTime: { type: Date, default: Date.now },
  },
  { collection: "notifications" }
);

NotificationSchema.index({ userID: 1, status: 1, sendDate: 1 });

export default mongoose.model("Notification", NotificationSchema);
