"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Shield, UserPlus, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    nik: "", 
    password: "", 
    role: "", 
    department: "" 
  });
  
  const fetchUsers = () => {
    setIsLoading(true);
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    fetch("/api/roles").then(res => res.json()).then(data => setRoles(data));
    fetch("/api/departments").then(res => res.json()).then(data => setDepartments(data));
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", nik: "", password: "", role: roles[0]?._id || "", department: departments[0]?._id || "" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      nik: user.nik, 
      password: "", // Leave blank for edit, only send if changing
      role: user.role?._id || "", 
      department: user.department?._id || "" 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser ? "PUT" : "POST";
      const payload: any = { ...formData };
      if (editingUser) {
        payload.id = editingUser._id;
        if (!payload.password) delete payload.password; // Don't send empty password on edit
      }
      
      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save user");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage employee accounts, emails for Google Auth, and system roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openAddModal} className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by NIK, Name, or Email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-primary w-full md:w-auto">
            <option>All Roles</option>
            <option>Admin SS</option>
            <option>Reviewer</option>
            <option>Proposer</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-primary w-full md:w-auto">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Production</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Google Auth)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">System Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Loading users...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => {
                  const roleName = user.role?.name || "Unknown";
                  let roleBadge = "bg-gray-100 text-gray-600 border border-gray-200";
                  if (roleName.includes("Admin")) roleBadge = "bg-violet-100 text-violet-800 border border-violet-200";
                  else if (roleName.includes("Reviewer")) roleBadge = "bg-blue-50 text-blue-700 border border-blue-200";
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${roleName.includes('Admin') ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                            <div className="text-xs text-gray-500">NIK: {user.nik}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-800">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.department?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleBadge}`}>
                          {roleName.includes("Admin") && <Shield className="w-3.5 h-3.5" />}
                          {roleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {users.length} users</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-white bg-primary transition-colors">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>

      </div>
      
      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingUser ? "Edit User" : "Add New User"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">NIK (Employee ID)</label>
                  <input type="text" required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Email (for Login)</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Password {editingUser && <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span>}</label>
                  <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Role</label>
                  <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="" disabled>Select Role</option>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Department</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="" disabled>Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm">
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

