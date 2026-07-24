import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Role.deleteMany({});

    // 1. Create Departments
    const deptHR = await Department.create({ name: "Human Resources", description: "HR Dept" });
    const deptProduction = await Department.create({ name: "Production", description: "Production Line A" });

    // 2. Create Roles
    const roleAdmin = await Role.create({
      name: "Admin SS",
      tag: "SYSTEM",
      description: "Full system access.",
      permissions: {
        canViewDashboard: true,
        canViewSuggestions: true,
        canCreateSuggestions: true,
        canManageSuggestions: true,
        canDeleteSuggestions: true,
      }
    });

    const roleHead = await Role.create({
      name: "Reviewer",
      tag: "INTERNAL",
      description: "Can review and approve suggestions.",
      permissions: {
        canViewDashboard: true,
        canViewSuggestions: true,
        canCreateSuggestions: true,
        canManageSuggestions: true,
        canDeleteSuggestions: false,
      }
    });

    const roleEmployee = await Role.create({
      name: "Proposer",
      tag: "INTERNAL",
      description: "Can propose ideas.",
      permissions: {
        canViewDashboard: true,
        canViewSuggestions: true,
        canCreateSuggestions: true,
        canManageSuggestions: false,
        canDeleteSuggestions: false,
      }
    });

    // 3. Create Users
    const passwordHash = await bcrypt.hash("password123", 10);

    await User.create([
      {
        name: "Budi Admin",
        email: "admin@dcci.com",
        nik: "ADMIN001",
        password: passwordHash,
        role: roleAdmin._id,
        department: deptHR._id,
      },
      {
        name: "Siti Manager",
        email: "siti@dcci.com",
        nik: "HEAD001",
        password: passwordHash,
        role: roleHead._id,
        department: deptProduction._id,
      },
      {
        name: "Agus Employee",
        email: "agus@dcci.com",
        nik: "EMP001",
        password: passwordHash,
        role: roleEmployee._id,
        department: deptProduction._id,
      }
    ]);

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database", details: error.message, stack: error.stack }, { status: 500 });
  }
}
