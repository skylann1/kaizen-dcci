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

    const news = await News.findById(params.id);
    if (!news) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasLiked = news.likes.includes(userId as any);

    if (hasLiked) {
      // Unlike
      news.likes = news.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      news.likes.push(userId as any);
    }

    await news.save();

    return NextResponse.json({ likesCount: news.likes.length, hasLiked: !hasLiked });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
