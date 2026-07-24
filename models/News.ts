import mongoose, { Document, Model, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  content: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  status: "Draft" | "Published";
  publishedAt?: Date;
  category: string;
  likes: mongoose.Types.ObjectId[];
  comments: {
    _id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    category: {
      type: String,
      enum: ["Pengumuman", "Event", "Update Sistem", "Lainnya"],
      default: "Lainnya",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

if (mongoose.models.News) {
  delete mongoose.models.News;
}

const News: Model<INews> = mongoose.model<INews>("News", NewsSchema);

export default News;
