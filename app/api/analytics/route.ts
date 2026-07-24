import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import Department from "@/models/Department";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Total Suggestions
    const totalSuggestions = await Suggestion.countDocuments();
    
    // Status breakdown
    const approved = await Suggestion.countDocuments({ status: "Approved" });
    const pending = await Suggestion.countDocuments({ status: "Pending" });
    const rejected = await Suggestion.countDocuments({ status: "Rejected" });
    const revision = await Suggestion.countDocuments({ status: "Revision" });

    // Financial Impact
    const impactAgg = await Suggestion.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: null, totalImpact: { $sum: "$costImpact" } } }
    ]);
    const totalImpact = impactAgg.length > 0 ? impactAgg[0].totalImpact : 0;

    // Category breakdown
    const categoryAgg = await Suggestion.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const trendAgg = await Suggestion.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = trendAgg.map(t => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      Usulan: t.count
    }));

    return NextResponse.json({
      overview: { totalSuggestions, totalImpact },
      status: [
        { name: "Approved", value: approved, fill: "#10b981" }, // emerald
        { name: "Pending", value: pending, fill: "#f59e0b" }, // amber
        { name: "Rejected", value: rejected, fill: "#ef4444" }, // red
        { name: "Revision", value: revision, fill: "#3b82f6" }, // blue
      ],
      categories: categoryAgg.map(c => ({ name: c._id, count: c.count })),
      trend: trendData
    });
  } catch (error: any) {
    console.error("GET analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
