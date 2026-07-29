import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISuggestion extends Document {
  title: string;
  problem: string;
  solution: string;
  category: "Safety / 5S / Lingkungan" | "Quality / Product Improvement" | "Cost Down / Efisiensi Biaya Operasional";
  images: {
    before?: string;
    after?: string;
  };
  status: "Pending" | "Approved" | "Rejected" | "Revision";
  pointsAwarded: number;
  costImpact: number;
  costEffective?: {
    explanation?: string;
    nominal?: number;
  };
  author: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  comments: {
    text: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  assessment?: {
    original: number;
    hoshinKanri: number;
    yokoten: number;
    sqcdmpe: {
      safety: number;
      quality: number;
      cost: number;
      delivery: number;
      morale: number;
      productivity: number;
      environment: number;
      peopleDevelopment: number;
    };
  };
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Safety / 5S / Lingkungan", "Quality / Product Improvement", "Cost Down / Efisiensi Biaya Operasional"],
      required: true,
    },
    images: {
      before: { type: String },
      after: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Revision"],
      default: "Pending",
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    costImpact: {
      type: Number,
      default: 0,
    },
    costEffective: {
      explanation: { type: String, trim: true },
      nominal: { type: Number, default: 0 },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    comments: [
      {
        text: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assessment: {
      original: { type: Number, default: 0, max: 25 },
      hoshinKanri: { type: Number, default: 0, max: 20 },
      yokoten: { type: Number, default: 0, max: 15 },
      sqcdmpe: {
        safety: { type: Number, default: 0, min: 0, max: 5 },
        quality: { type: Number, default: 0, min: 0, max: 5 },
        cost: { type: Number, default: 0, min: 0, max: 5 },
        delivery: { type: Number, default: 0, min: 0, max: 5 },
        morale: { type: Number, default: 0, min: 0, max: 5 },
        productivity: { type: Number, default: 0, min: 0, max: 5 },
        environment: { type: Number, default: 0, min: 0, max: 5 },
        peopleDevelopment: { type: Number, default: 0, min: 0, max: 5 },
      },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Suggestion) {
  delete mongoose.models.Suggestion;
}
const Suggestion: Model<ISuggestion> = mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

export default Suggestion;
