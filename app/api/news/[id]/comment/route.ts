import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import News from "@/models/News";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const news = await News.findById(params.id);
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newComment = {
      user: session.user.id as any,
      text: text.trim(),
      createdAt: new Date(),
    };

    news.comments.push(newComment);
    await news.save();

    // Re-fetch to populate user
    const updatedNews = await News.findById(params.id).populate("comments.user", "name nik profilePicture");
    const addedComment = updatedNews?.comments[updatedNews.comments.length - 1];

    return NextResponse.json(addedComment, { status: 201 });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
