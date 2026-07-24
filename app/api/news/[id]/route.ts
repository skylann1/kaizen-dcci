import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import News from "@/models/News";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const news = await News.findById(params.id)
      .populate("author", "name nik profilePicture")
      .populate("comments.user", "name nik profilePicture");
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Failed to fetch news detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (!session.user.permissions?.canManageNews && !session.user.permissions?.canManageSystem && session.user.role !== "Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as string;
    const category = formData.get("category") as string;
    const coverImage = formData.get("coverImage") as File | null;
    const deleteCoverImage = formData.get("deleteCoverImage") === "true";

    const existingNews = await News.findById(params.id);
    if (!existingNews) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let coverImagePath = existingNews.coverImage;

    if (deleteCoverImage) {
       // Optional: delete actual file if you want, or just remove reference
       coverImagePath = "";
    } else if (coverImage) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const ext = path.extname(coverImage.name) || ".jpg";
      const filename = `news-${uuidv4()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "news");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      coverImagePath = `/uploads/news/${filename}`;
    }

    if (title) existingNews.title = title;
    if (content) existingNews.content = content;
    if (category) existingNews.category = category;
    
    if (status) {
      if (status === "Published" && existingNews.status !== "Published") {
        existingNews.publishedAt = new Date();
      }
      existingNews.status = status;
    }
    
    existingNews.coverImage = coverImagePath;

    await existingNews.save();

    return NextResponse.json(existingNews);
  } catch (error) {
    console.error("Failed to update news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || (!session.user.permissions?.canManageNews && !session.user.permissions?.canManageSystem && session.user.role !== "Admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedNews = await News.findByIdAndDelete(params.id);
    if (!deletedNews) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
