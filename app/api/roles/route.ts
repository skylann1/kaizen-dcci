import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Role from "@/models/Role";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let query: any = {};
    if ((session.user as any).role !== "God") {
      query.name = { $ne: "God" };
    }
    
    const roles = await Role.find(query).sort({ createdAt: -1 });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Fetch roles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectToDatabase();
    
    const newRole = await Role.create(data);
    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const updatedRole = await Role.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const deletedRole = await Role.findByIdAndDelete(id);
    
    if (!deletedRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
