import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Suggestion from "@/models/Suggestion";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Usually, you might restrict export to only Admins or HR, but here we allow any authenticated user or based on role
    if (!session.user.permissions?.canManageSuggestions && session.user.role !== "Admin") {
      // return new NextResponse("Forbidden", { status: 403 }); 
      // Un-comment the line above to restrict who can export
    }

    await connectToDatabase();
    
    const suggestions = await Suggestion.find()
      .populate("author", "name nik")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Create CSV Header
    let csvData = "ID,Tanggal,Penulis,NIK,Departemen,Kategori,Judul,Status,Poin,Target Selesai\n";

    // Populate rows
    suggestions.forEach((item: any) => {
      const id = item._id.toString().substring(item._id.toString().length - 8).toUpperCase();
      const date = new Date(item.createdAt).toLocaleDateString("id-ID");
      const author = item.author?.name || "Unknown";
      const nik = item.author?.nik || "Unknown";
      const dept = item.department?.name || "Unknown";
      const category = item.category || "";
      const title = `"${(item.title || "").replace(/"/g, '""')}"`; // Escape quotes
      const status = item.status;
      const points = item.pointsAwarded || 0;
      const target = item.targetDate ? new Date(item.targetDate).toLocaleDateString("id-ID") : "N/A";

      csvData += `${id},${date},${author},${nik},${dept},${category},${title},${status},${points},${target}\n`;
    });

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="suggestions_report.csv"',
      }
    });

  } catch (error: any) {
    console.error("GET export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
