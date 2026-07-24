import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import News from "@/models/News";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAdmin = session.user.role === "Admin" || session.user.permissions?.canManageSystem || session.user.permissions?.canManageNews;
    const fetchAll = searchParams.get("all") === "true" && isAdmin;

    const query = fetchAll ? {} : { status: "Published" };

    const news = await News.find(query)
      .populate("author", "name nik profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const category = formData.get("category") as string || "Lainnya";
    const coverImage = formData.get("coverImage") as File | null;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    let coverImagePath = "";
    if (coverImage) {
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

    const newNews = new News({
      title,
      content,
      status,
      category,
      coverImage: coverImagePath,
      author: session.user.id,
      publishedAt: status === "Published" ? new Date() : undefined
    });

    await newNews.save();

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error("Failed to create news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
