import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Department from "@/models/Department";
import User from "@/models/User";
import Role from "@/models/Role";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    // Ensure User and Role models are loaded before population
    const userCheck = User;
    const roleCheck = Role;
    const session = await getServerSession(authOptions);
    let query: any = {};
    
    if (session?.user && (session.user as any).role !== "God") {
      query.name = { $ne: "System Admin" };
    }

    const departments = await Department.find(query).populate("head", "name email");
    return NextResponse.json(departments);
  } catch (error) {
    console.error("GET departments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    
    if (data.head === "") {
      data.head = null;
    }

    await connectToDatabase();
    const newDept = await Department.create(data);
    return NextResponse.json(newDept, { status: 201 });
  } catch (error: any) {
    console.error("Create department error:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Department name already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updateData } = await req.json();
    if (!id) return NextResponse.json({ error: "Department ID is required" }, { status: 400 });

    if (updateData.head === "") {
      updateData.head = null;
    }

    await connectToDatabase();
    const updatedDept = await Department.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedDept) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    return NextResponse.json(updatedDept);
  } catch (error: any) {
    console.error("Update department error:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Department name already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Department ID is required" }, { status: 400 });

    await connectToDatabase();
    // In a real system, check if users are assigned to this department before deleting
    const deletedDept = await Department.findByIdAndDelete(id);
    
    if (!deletedDept) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
