import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPointLog extends Document {
  user: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  suggestion: mongoose.Types.ObjectId;
  points: number;
  type: "Submission" | "Approval";
  period: string; // Format: "YYYY-MM"
  createdAt: Date;
}

const PointLogSchema = new Schema<IPointLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    suggestion: {
      type: Schema.Types.ObjectId,
      ref: "Suggestion",
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Submission", "Approval"],
      required: true,
    },
    period: {
      type: String,
      required: true,
      index: true, // index for faster queries on period
    },
  },
  { timestamps: true }
);

const PointLog: Model<IPointLog> = mongoose.models.PointLog || mongoose.model<IPointLog>("PointLog", PointLogSchema);

export default PointLog;
