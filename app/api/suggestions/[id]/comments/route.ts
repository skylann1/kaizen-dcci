import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // Add the comment
    const newComment = {
      text,
      author: session.user.id,
      createdAt: new Date()
    };
    
    suggestion.comments.push(newComment as any);
    await suggestion.save();

    // Create Notification if the commenter is not the author
    if (suggestion.author.toString() !== session.user.id) {
      await Notification.create({
        recipient: suggestion.author,
        type: "INFO",
        title: "New Comment",
        message: `<strong>${session.user.name}</strong> left a comment on your suggestion.`,
        link: `/dashboard/suggestions/${suggestion._id}`,
      });
    }

    // Populate the author so the frontend gets the full object back
    await suggestion.populate("comments.author", "name role");

    // Return the newly added comment (which is the last one in the array)
    const savedComment = suggestion.comments[suggestion.comments.length - 1];

    return NextResponse.json(savedComment, { status: 201 });
  } catch (error: any) {
    console.error("POST comment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
