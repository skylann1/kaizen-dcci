"use client";

import React, { useState, useEffect } from "react";
import { Shield, Users, SlidersHorizontal, CheckSquare, Square, XCircle, X, Trash2 } from "lucide-react";

interface RolePermissions {
  canViewDashboard: boolean;
  canViewSuggestions: boolean;
  canCreateSuggestions: boolean;
  canManageSuggestions: boolean;
  canDeleteSuggestions: boolean;
  canManageSystem: boolean;
  canManageNews: boolean;
  canViewTerms: boolean;
}

interface Role {
  _id: string;
  name: string;
  tag: "SYSTEM" | "INTERNAL" | "EXTERNAL";
  description: string;
  permissions: RolePermissions;
  usersCount?: number; // Fetched separately
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRole] = useState<string>("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      
      // Fetch users to get counts
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      
      const rolesWithCounts = data.map((role: Role) => {
        const count = Array.isArray(usersData) 
          ? usersData.filter((u: any) => u.role?._id === role._id || u.role?.name === role.name).length 
          : 0;
        return { ...role, usersCount: count };
      });
      
      setRoles(rolesWithCounts);
      if (rolesWithCounts.length > 0 && !activeRole) {
        setActiveRole(rolesWithCounts[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const currentRoleData = roles.find(r => r._id === activeRole);

  const handleEditClick = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(JSON.parse(JSON.stringify(role))); // Deep copy
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setEditingRole({
      _id: "new",
      name: "",
      tag: "INTERNAL",
      description: "",
      permissions: {
        canViewDashboard: false,
        canViewSuggestions: false,
        canCreateSuggestions: false,
        canManageSuggestions: false,
        canDeleteSuggestions: false,
        canManageSystem: false,
        canManageNews: false,
        canViewTerms: true,
      }
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this role?")) return;
    
    try {
      const res = await fetch(`/api/roles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeRole === id) setActiveRole("");
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete role");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!editingRole) return;
    
    try {
      const method = isAdding ? "POST" : "PUT";
      const body = {
        name: editingRole.name,
        tag: editingRole.tag,
        description: editingRole.description,
        permissions: editingRole.permissions,
        ...(isAdding ? {} : { id: editingRole._id })
      };
      
      const res = await fetch("/api/roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setEditingRole(null);
        setIsAdding(false);
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save role");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const togglePermission = (key: keyof RolePermissions) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [key]: !editingRole.permissions[key]
      }
    });
  };

  const getTagColor = (tag: string) => {
    if (tag === "SYSTEM") return "bg-gray-100 text-gray-600";
    if (tag === "INTERNAL") return "bg-emerald-100 text-emerald-700";
    if (tag === "EXTERNAL") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN: ROLES LIST */}
      <div className="w-full lg:w-7/12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-display">
              <Shield className="w-5 h-5 text-primary" />
              Daftar Peran
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full hidden sm:inline-block">
                {roles.length} Total Role
              </span>
              <button 
                onClick={handleAddClick}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span className="text-lg leading-none">+</span> Tambah
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="col-span-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Role</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pengguna</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</div>
          </div>

          {/* Roles List */}
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No roles found</div>
            ) : (
              roles.map((role) => (
                <div 
                  key={role._id}
                  onClick={() => setActiveRole(role._id)}
                  className={`grid grid-cols-12 gap-2 px-5 py-4 cursor-pointer transition-colors relative ${
                    activeRole === role._id ? "bg-blue-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Active Indicator */}
                  {activeRole === role._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  )}
                  
                  {/* Role Info */}
                  <div className="col-span-8">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{role.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTagColor(role.tag)}`}>
                        {role.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 pr-2">{role.description || "No description"}</p>
                  </div>

                  {/* Users Count */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      <Users className="w-3.5 h-3.5" />
                      {role.usersCount || 0}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex items-center justify-end text-gray-400 gap-1">
                    <button 
                      onClick={(e) => handleEditClick(role, e)}
                      className="p-2 hover:text-primary hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-200"
                      title="Edit Hak Akses"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    {role.name !== "Admin" && (
                      <button 
                        onClick={(e) => handleDelete(role._id, e)}
                        className="p-2 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-red-200"
                        title="Hapus Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: READ-ONLY PREVIEW */}
      <div className="w-full lg:w-5/12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full min-h-[500px]">
          {currentRoleData ? (
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1">Preview Hak Akses</h3>
              <p className="text-sm text-gray-500 mb-6">
                Role: <span className="font-bold text-primary">{currentRoleData.name}</span>
              </p>

              <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                
                {/* Module 1 Preview */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dashboard Overview</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canViewDashboard ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canViewDashboard ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>
                        Melihat Statistik & Metrik
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canViewTerms ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canViewTerms ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>
                        Melihat Terms of Service
                      </span>
                    </div>
                  </div>
                </div>

                {/* Module 2 Preview */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Modul Suggestion & Kaizen</h4>
                  <div className="space-y-2">
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canViewSuggestions ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canViewSuggestions ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Melihat Daftar Suggestion</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canCreateSuggestions ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canCreateSuggestions ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Membuat Suggestion Baru</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canManageSuggestions ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canManageSuggestions ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Mengelola / Approve Ide</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canDeleteSuggestions ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canDeleteSuggestions ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Menghapus / Void Ide</span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canManageSystem ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canManageSystem ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Sistem & Master Data (Departemen, Users, Role)</span>
                    </div>



                  </div>
                </div>

                {/* Module 3 Preview */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Modul Berita (News)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-70">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {currentRoleData.permissions.canManageNews ? (
                          <CheckSquare className="w-3 h-3 text-primary" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${currentRoleData.permissions.canManageNews ? 'text-slate-700' : 'text-gray-500 line-through decoration-gray-300'}`}>Mengelola Portal Berita (News)</span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex items-center justify-center text-gray-400 text-sm">
              Pilih role untuk melihat preview hak akses
            </div>
          )}
        </div>
      </div>

      {/* EDIT/ADD MODAL */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-800">{isAdding ? "Tambah Role Baru" : "Edit Hak Akses"}</h2>
                <p className="text-sm text-gray-500">
                  Role: <span className="font-bold text-primary">{editingRole.name || "-"}</span>
                </p>
              </div>
              <button 
                onClick={() => setEditingRole(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body (Editable Form & Cards) */}
            <div className="p-6 space-y-8">
              
              {/* Role Profile Edit */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Profil Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Nama Role</label>
                    <input 
                      type="text" 
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Contoh: Admin SS"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Tag Status</label>
                    <div className="flex gap-2">
                      <select 
                        value={editingRole.tag}
                        onChange={(e) => setEditingRole({ ...editingRole, tag: e.target.value as any })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="INTERNAL">INTERNAL</option>
                        <option value="EXTERNAL">EXTERNAL</option>
                        <option value="SYSTEM">SYSTEM</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Deskripsi Role</label>
                    <textarea 
                      value={editingRole.description}
                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder="Penjelasan singkat mengenai peran ini"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Permissions Edit */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Hak Akses Modul</h3>
                <div className="space-y-6">
                  {/* Module 1 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Dashboard Overview</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Akses ke halaman utama dashboard dan statistik keseluruhan.</p>
                      </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label onClick={() => togglePermission('canViewDashboard')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canViewDashboard ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Melihat Statistik & Metrik</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan aksi 'view' pada Dashboard Overview.</div>
                        </div>
                      </label>

                      <label onClick={() => togglePermission('canViewTerms')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canViewTerms ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Melihat Terms of Service</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan akses untuk melihat halaman legal & kepatuhan.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Modul Suggestion & Kaizen</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Manajemen pengajuan ide, persetujuan, dan master data.</p>
                      </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label onClick={() => togglePermission('canViewSuggestions')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canViewSuggestions ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Melihat Daftar Suggestion</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan aksi 'view' pada Modul Suggestion.</div>
                        </div>
                      </label>

                      <label onClick={() => togglePermission('canCreateSuggestions')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canCreateSuggestions ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Membuat Suggestion Baru</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan aksi 'create' pada Modul Suggestion.</div>
                        </div>
                      </label>

                      <label onClick={() => togglePermission('canManageSuggestions')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canManageSuggestions ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Mengelola / Approve Ide</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan aksi 'manage' pada Modul Suggestion.</div>
                        </div>
                      </label>

                      <label onClick={() => togglePermission('canDeleteSuggestions')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all">
                        <div className="mt-0.5">
                          {editingRole.permissions.canDeleteSuggestions ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Menghapus / Void Ide</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan aksi 'delete' pada master data Suggestion.</div>
                        </div>
                      </label>
                      
                      <label onClick={() => togglePermission('canManageSystem')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all md:col-span-2">
                        <div className="mt-0.5">
                          {editingRole.permissions.canManageSystem ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Mengelola Sistem & Master Data</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan pengaturan menu 'Departemen', 'Users', dan 'Roles & Permissions'. Biasanya hanya untuk Admin.</div>
                        </div>
                      </label>

                    </div>
                  </div>

                  {/* Module 3 */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Modul Berita (News)</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Manajemen publikasi berita dan artikel perusahaan.</p>
                      </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label onClick={() => togglePermission('canManageNews')} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all md:col-span-2">
                        <div className="mt-0.5">
                          {editingRole.permissions.canManageNews ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Mengelola Berita (News)</div>
                          <div className="text-xs text-gray-500 mt-1">Izinkan membuat, mengedit, dan menghapus artikel/berita di portal dashboard.</div>
                        </div>
                      </label>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 flex items-center justify-end gap-3 z-10">
              <button 
                onClick={() => setEditingRole(null)}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
