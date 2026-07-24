import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  head?: mongoose.Types.ObjectId;
  totalPoints: number;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
