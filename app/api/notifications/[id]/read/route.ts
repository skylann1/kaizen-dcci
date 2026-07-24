import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params per Next.js 15+ constraints
    const { id } = await params;
    if (!id) {
      return new NextResponse("Notification ID required", { status: 400 });
    }

    await connectToDatabase();
    
    // Find the notification and ensure it belongs to the current user
    const notification = await Notification.findOne({ _id: id, recipient: session.user.id });
    
    if (!notification) {
      return new NextResponse("Notification not found or unauthorized", { status: 404 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json(notification);
  } catch (error) {
    console.error("PATCH mark as read error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
