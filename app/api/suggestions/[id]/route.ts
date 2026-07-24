import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import User from "@/models/User";
import Department from "@/models/Department";
import Notification from "@/models/Notification";
import PointLog from "@/models/PointLog";

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    const suggestion = await Suggestion.findById(id)
      .populate("author", "name nik role")
      .populate("department", "name")
      .populate("comments.author", "name role");

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    return NextResponse.json(suggestion);
  } catch (error: any) {
    console.error("GET suggestion details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SectionHead or Admin should be able to approve
    if (session.user.role === "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, costImpact, assessment } = await req.json();
    if (!status || !["Approved", "Rejected", "Revision"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    const suggestion = await Suggestion.findById(id);

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // If it's already approved, don't award points again
    if (suggestion.status === "Approved") {
      return NextResponse.json({ error: "Suggestion is already approved" }, { status: 400 });
    }

    suggestion.status = status;

    let bonusPoints = 0;
    if (status === "Approved") {
      if (assessment) {
        suggestion.assessment = assessment;
        const sqcdme = assessment.sqcdme || {};
        bonusPoints = 
          (assessment.levelProposal || 0) +
          (assessment.keaslianTema || 0) +
          (assessment.pengembanganIde || 0) +
          (sqcdme.safety || 0) +
          (sqcdme.quality || 0) +
          (sqcdme.cost || 0) +
          (sqcdme.delivery || 0) +
          (sqcdme.moral || 0) +
          (sqcdme.environment || 0);
      } else {
        // Fallback just in case
        bonusPoints = 0;
      }

      suggestion.pointsAwarded += bonusPoints;
      
      // Award points to the user and department
      await User.findByIdAndUpdate(suggestion.author, {
        $inc: { personalPoints: bonusPoints }
      });
      await Department.findByIdAndUpdate(suggestion.department, {
        $inc: { totalPoints: bonusPoints }
      });

      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      await PointLog.create({
        user: suggestion.author,
        department: suggestion.department,
        suggestion: suggestion._id,
        points: bonusPoints,
        type: "Approval",
        period: period
      });
    }

    if (costImpact !== undefined && !isNaN(Number(costImpact))) {
      suggestion.costImpact = Number(costImpact);
    }

    await suggestion.save();

    // Create Notification for the author
    let message = "";
    let type = "INFO";
    if (status === "Approved") {
      message = `Your suggestion has been Approved! You earned +${bonusPoints} points.`;
      type = "SUCCESS";
    } else if (status === "Rejected") {
      message = `Your suggestion has been Rejected.`;
      type = "WARNING";
    } else if (status === "Revision") {
      message = `Your suggestion requires Revision.`;
      type = "ACTION";
    }

    await Notification.create({
      recipient: suggestion.author,
      type,
      title: `Suggestion ${status}`,
      message,
      link: `/dashboard/suggestions/${suggestion._id}`,
    });

    return NextResponse.json(suggestion);
  } catch (error: any) {
    console.error("PATCH suggestion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
