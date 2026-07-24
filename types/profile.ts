/* eslint-disable @typescript-eslint/no-explicit-any */
interface permissions {
    canViewTerms: boolean;
    canManageSystem: boolean;
    canViewDashboard: boolean;
    canViewSuggestions: boolean;
    canCreateSuggestions: boolean;
    canManageSuggestions: boolean;
    canDeleteSuggestions: boolean;
    canManageNews: boolean;
}

interface role {
    _id: string;
    name: string;
    tag: string;
    permissions: permissions;
}

export default interface Profile {
    _id: string;
    name: string;
    email: string;
    nik: string;
    profilePicture?: string;
    role: role;
    department: Record<string, any>;
    personalPoints: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}