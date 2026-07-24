import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Process Statuses counts
    const completedCount = await Suggestion.countDocuments({ status: "Approved" });
    const pendingCount = await Suggestion.countDocuments({ status: "Pending" });
    const rejectedCount = await Suggestion.countDocuments({ status: "Rejected" });
    
    // My Pending Tasks (Suggestions authored by me that are pending)
    const myPendingCount = await Suggestion.countDocuments({ 
      author: session.user.id, 
      status: "Pending" 
    });

    const myCompletedCount = await Suggestion.countDocuments({ 
      author: session.user.id, 
      status: "Approved" 
    });

    // Recent Transactions (Last 2 of my suggestions)
    const myRecentSuggestions = await Suggestion.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    return NextResponse.json({
      personalPoints: user.personalPoints || 0,
      processStatuses: {
        completed: completedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
      myTasks: {
        pending: myPendingCount,
        completed: myCompletedCount,
      },
      myRecentSuggestions
    });
  } catch (error: any) {
    console.error("GET dashboard stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
