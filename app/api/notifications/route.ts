import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch last 50 notifications for the current user
    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET notifications error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    
    // Mark all as read for current user
    await Notification.updateMany(
      { recipient: session.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("PATCH mark all read error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
