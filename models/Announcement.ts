import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["INFO", "WARNING", "SUCCESS", "URGENT"],
      default: "INFO",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Announcement) {
  delete mongoose.models.Announcement;
}

const Announcement: Model<IAnnouncement> = mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
