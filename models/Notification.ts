import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User ID
  type: "INFO" | "SUCCESS" | "WARNING" | "ACTION";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ACTION"],
      default: "INFO",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
