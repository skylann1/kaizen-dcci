import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import PointLog from "@/models/PointLog";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const url = new URL(req.url);
    const queryPeriod = url.searchParams.get("period");
    
    let period = queryPeriod;
    if (!period) {
      const now = new Date();
      period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Aggregate points per user for the specified period
    const aggregated = await PointLog.aggregate([
      { $match: { period: period } },
      { $group: { _id: "$user", personalPoints: { $sum: "$points" } } },
      { $sort: { personalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "departments",
          localField: "userDetails.department",
          foreignField: "_id",
          as: "departmentDetails"
        }
      },
      { $unwind: { path: "$departmentDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          personalPoints: 1,
          department: {
            _id: "$departmentDetails._id",
            name: "$departmentDetails.name"
          }
        }
      }
    ]);

    // If no points in this period, fallback to empty array or some users with 0 points
    // Let's just return what we aggregated. If empty, the UI will handle it or we can return top users with 0 points.
    if (aggregated.length === 0) {
      const fallbackUsers = await User.find()
        .populate("department", "name")
        .limit(10)
        .select("name department")
        .lean();
      
      const formattedFallback = fallbackUsers.map(u => ({
        _id: u._id,
        name: u.name,
        personalPoints: 0,
        department: u.department
      }));
      return NextResponse.json(formattedFallback);
    }

    return NextResponse.json(aggregated);
  } catch (error: any) {
    console.error("GET users leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
