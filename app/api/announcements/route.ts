import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import Role from "@/models/Role";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    // Fetch all announcements, sort by created desc
    const announcements = await Announcement.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error("GET announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be Admin to post announcement
    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, message, type, isActive } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const newAnnouncement = await Announcement.create({
      title,
      message,
      type: type || "INFO",
      isActive: isActive !== undefined ? isActive : true,
      createdBy: session.user.id
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    console.error("POST announcement error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
