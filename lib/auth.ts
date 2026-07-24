import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Role from "@/models/Role";
import Department from "@/models/Department";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nik: { label: "NIK (Employee ID)", type: "text", placeholder: "Enter your NIK" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("AUTHORIZE CALLED with credentials:", credentials);
        if (!credentials?.nik || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Missing NIK or password");
        }

        try {
          // Force Webpack to not strip these imports and register the models
          console.log("Loading models:", Role.modelName, Department.modelName);
          
          await connectToDatabase();
          console.log("DB connected");

          const user = await User.findOne({ nik: credentials.nik }).populate("role", "name permissions");
          console.log("User found:", !!user);

          if (!user) {
            console.log("User not found for NIK:", credentials.nik);
            throw new Error("Invalid NIK or password");
          }

          console.log("Checking password for user:", user.nik);
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Password invalid");
            throw new Error("Invalid NIK or password");
          }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role?.name || "Employee",
          department: user.department.toString(),
          permissions: {
            canViewDashboard: user.role?.permissions?.canViewDashboard ?? false,
            canViewSuggestions: user.role?.permissions?.canViewSuggestions ?? true,
            canCreateSuggestions: user.role?.permissions?.canCreateSuggestions ?? true,
            canManageSuggestions: user.role?.permissions?.canManageSuggestions ?? false,
            canDeleteSuggestions: user.role?.permissions?.canDeleteSuggestions ?? false,
            canManageSystem: user.role?.permissions?.canManageSystem ?? false,
            canManageNews: user.role?.permissions?.canManageNews ?? false,
            canViewTerms: user.role?.permissions?.canViewTerms ?? true
          }
        };
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.permissions = token.permissions as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
