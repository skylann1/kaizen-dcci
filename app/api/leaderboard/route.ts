import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Department from "@/models/Department";
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

    // Aggregate points per department for the specified period
    const aggregated = await PointLog.aggregate([
      { $match: { period: period } },
      { $group: { _id: "$department", totalPoints: { $sum: "$points" } } },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "departmentDetails"
        }
      },
      { $unwind: "$departmentDetails" },
      {
        $project: {
          _id: 1,
          name: "$departmentDetails.name",
          totalPoints: 1
        }
      }
    ]);

    // If there is no PointLog data for this period yet, we can fallback to listing departments with 0 points
    if (aggregated.length === 0) {
       const allDepartments = await Department.find().select("name").lean();
       const fallbackLeaderboard = allDepartments.map(d => ({
         _id: d._id,
         name: d.name,
         totalPoints: 0
       }));
       return NextResponse.json(fallbackLeaderboard);
    }

    return NextResponse.json(aggregated);
  } catch (error: any) {
    console.error("GET leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
