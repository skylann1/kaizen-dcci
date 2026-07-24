import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";
import Role from "@/models/Role";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Ensure Department model is registered
    const departmentCheck = Department;

    const roleCheck = Role;

    const userProfile = await User.findById((session.user as any).id)
      .populate("department", "name")
      .populate("role", "name tag permissions")
      .select("-password");

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let profilePicturePath = "";

    if (profilePicture && profilePicture.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const filename = `${Date.now()}-profile-${profilePicture.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      profilePicturePath = `/uploads/${filename}`;
    }

    await connectToDatabase();

    const updateData: any = { name };
    if (profilePicturePath) {
      updateData.profilePicture = profilePicturePath;
    }

    await User.findByIdAndUpdate(
      (session.user as any).id,
      updateData
    );

    const updatedUser = await User.findById((session.user as any).id)
      .populate("department", "name")
      .populate("role", "name tag permissions")
      .select("-password");

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
