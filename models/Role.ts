import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  tag: "SYSTEM" | "INTERNAL" | "EXTERNAL";
  description: string;
  permissions: {
    canViewDashboard: boolean;
    canViewSuggestions: boolean;
    canCreateSuggestions: boolean;
    canManageSuggestions: boolean;
    canDeleteSuggestions: boolean;
    canManageSystem: boolean;
    canManageNews: boolean;
    canViewTerms: boolean;
  };
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tag: {
      type: String,
      enum: ["SYSTEM", "INTERNAL", "EXTERNAL"],
      default: "INTERNAL",
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      canViewDashboard: { type: Boolean, default: false },
      canViewSuggestions: { type: Boolean, default: false },
      canCreateSuggestions: { type: Boolean, default: false },
      canManageSuggestions: { type: Boolean, default: false },
      canDeleteSuggestions: { type: Boolean, default: false },
      canManageSystem: { type: Boolean, default: false },
      canManageNews: { type: Boolean, default: false },
      canViewTerms: { type: Boolean, default: true },
    }
  },
  { timestamps: true }
);

if (mongoose.models.Role) {
  delete mongoose.models.Role;
}
const Role: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);

export default Role;
