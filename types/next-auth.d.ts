import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      department: string;
      permissions: {
        canViewDashboard: boolean;
        canViewSuggestions: boolean;
        canCreateSuggestions: boolean;
        canManageSuggestions: boolean;
        canDeleteSuggestions: boolean;
        canManageSystem: boolean;
        canManageNews: boolean;
      };
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    department: string;
    permissions?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    department: string;
    permissions?: any;
  }
}
