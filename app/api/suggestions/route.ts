import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";
import User from "@/models/User";
import Department from "@/models/Department";
import Role from "@/models/Role";
import Notification from "@/models/Notification";
import PointLog from "@/models/PointLog";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = {};
    
    // Role-based filtering:
    // If the user is an Employee, they can only see their own suggestions.
    // Managers/Admins can see all suggestions.
    if (session.user.role === "Employee") {
      query = { author: session.user.id };
    }

    const suggestions = await Suggestion.find(query)
      .populate("author", "name nik")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error("GET suggestions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const problem = formData.get("problem") as string;
    const solution = formData.get("solution") as string;
    const category = formData.get("category") as string;
    const departmentId = formData.get("department") as string;
    const costEffectiveExplanation = formData.get("costEffectiveExplanation") as string;
    const costEffectiveNominal = formData.get("costEffectiveNominal") as string;
    
    if (!title || !problem || !solution || !category || !departmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const beforeImage = formData.get("beforeImage") as File | null;
    const afterImage = formData.get("afterImage") as File | null;

    let beforeImagePath = "";
    let afterImagePath = "";

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    if (beforeImage && beforeImage.size > 0) {
      const buffer = Buffer.from(await beforeImage.arrayBuffer());
      const filename = `${Date.now()}-before-${beforeImage.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      beforeImagePath = `/uploads/${filename}`;
    }

    if (afterImage && afterImage.size > 0) {
      const buffer = Buffer.from(await afterImage.arrayBuffer());
      const filename = `${Date.now()}-after-${afterImage.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      afterImagePath = `/uploads/${filename}`;
    }

    await connectToDatabase();

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Validate max 5 suggestions per month
    const currentMonthSuggestions = await Suggestion.countDocuments({
      author: session.user.id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (currentMonthSuggestions >= 5) {
      return NextResponse.json({ error: "Anda telah mencapai batas maksimal 5 usulan untuk periode bulan ini." }, { status: 400 });
    }

    // Base participation points = 5
    const participationPoints = 5;

    const newSuggestion = await Suggestion.create({
      title,
      problem,
      solution,
      category,
      costEffective: {
        explanation: costEffectiveExplanation || "",
        nominal: costEffectiveNominal ? Number(costEffectiveNominal) : 0,
      },
      images: {
        before: beforeImagePath,
        after: afterImagePath,
      },
      status: "Pending",
      author: session.user.id,
      department: departmentId,
      pointsAwarded: participationPoints, // Initial points for submitting
    });

    // Update Gamification Points for User and Department (All-time)
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { personalPoints: participationPoints }
    });

    await Department.findByIdAndUpdate(departmentId, {
      $inc: { totalPoints: participationPoints }
    });

    // Record PointLog for period-based tracking
    await PointLog.create({
      user: session.user.id,
      department: departmentId,
      suggestion: newSuggestion._id,
      points: participationPoints,
      type: "Submission",
      period: period
    });

    // Notify users with canManageSuggestions
    const managerRoles = await Role.find({ "permissions.canManageSuggestions": true }).select("_id");
    const managerRoleIds = managerRoles.map(r => r._id);
    
    if (managerRoleIds.length > 0) {
      const managers = await User.find({ role: { $in: managerRoleIds } }).select("_id");
      
      const notifications = managers.map(manager => ({
        recipient: manager._id,
        type: "INFO",
        title: "New Suggestion Submitted",
        message: `${session.user.name} submitted a new suggestion in the ${category} category.`,
        link: `/dashboard/suggestions/${newSuggestion._id}`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error: any) {
    console.error("POST suggestion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
