"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Users, X } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "", head: "" });
  
  const fetchDepartments = () => {
    setIsLoading(true);
    fetch("/api/departments")
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDepartments();
    fetch("/api/users").then(res => res.json()).then(data => setUsers(data));
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: "", description: "", head: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description, head: dept.head?._id || "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`/api/departments?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchDepartments();
      else alert("Failed to delete department");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingDept ? "PUT" : "POST";
      const body = editingDept ? { id: editingDept._id, ...formData } : formData;
      const res = await fetch("/api/departments", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchDepartments();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save department");
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
          <h2 className="text-2xl font-bold font-display text-slate-800">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage corporate departments and their overall gamification scores.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openAddModal} className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Department
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
            placeholder="Search departments or managers..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department Head (Manager)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Active Members</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Points</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Loading departments...</td>
                </tr>
              ) : departments.length > 0 ? (
                departments.map((dept, index) => {
                  const colors = [
                    "bg-blue-100 text-blue-700",
                    "bg-emerald-100 text-emerald-700",
                    "bg-purple-100 text-purple-700",
                    "bg-orange-100 text-orange-700"
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{dept.name}</div>
                        <div className="text-xs text-gray-500">{dept.description || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center font-bold text-xs uppercase`}>
                            {dept.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{dept.head?.name || "-"}</div>
                            <div className="text-xs text-gray-500">{dept.head ? "Head Assigned" : "Head Unassigned"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <Users className="w-3.5 h-3.5" />
                          {users.filter(u => u.department?._id === dept._id).length}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-primary">{dept.totalPoints || 0} pts</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEditModal(dept)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(dept._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {departments.length} departments</span>
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{editingDept ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Department Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Department Head</label>
                <select 
                  value={formData.head}
                  onChange={(e) => setFormData({...formData, head: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">No Head Assigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm">
                  {editingDept ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
