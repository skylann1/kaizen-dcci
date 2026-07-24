import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // Ensure models are registered
    const depCheck = Department;
    const roleCheck = Role;

    // Fetch all users and populate their department and role
    let query: any = {};
    if ((session.user as any).role !== "God") {
      const godRole = await Role.findOne({ name: "God" });
      if (godRole) {
        query.role = { $ne: godRole._id };
      }
    }

    const users = await User.find(query)
      .populate("department", "name")
      .populate("role", "name")
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.name || !data.email || !data.nik || !data.password || !data.role || !data.department) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const newUser = await User.create({
      ...data,
      password: hashedPassword
    });
    
    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error("Create user error:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Email or NIK already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, password, ...updateData } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    
    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Email or NIK already exists" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // Prevent deleting self
    if (id === (session.user as any).id) {
       return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
