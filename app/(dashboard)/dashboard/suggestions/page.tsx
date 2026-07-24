"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function AllSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">All Suggestions</h2>
          <p className="text-sm text-gray-500 mt-1">Master view of all ideas submitted across the company.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open('/api/suggestions/export', '_blank')}
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm font-medium rounded-xl px-4 py-2 text-slate-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-primary text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Advanced Filters
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
            placeholder="Search by ID, NIK, or Proposer Name..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-primary w-full md:w-auto">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Production</option>
            <option>Quality Assurance</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-primary w-full md:w-auto">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>In Process</option>
            <option>Completed</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID & Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Proposer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Loading suggestions...</td>
                </tr>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => {
                  let statusBg = "bg-amber-50 text-amber-700 border-amber-200";
                  let statusDot = "bg-amber-500";
                  if (suggestion.status === "Approved") {
                    statusBg = "bg-green-50 text-green-700 border-green-200";
                    statusDot = "bg-green-500";
                  } else if (suggestion.status === "Rejected") {
                    statusBg = "bg-red-50 text-red-700 border-red-200";
                    statusDot = "bg-red-500";
                  }

                  let categoryBg = "bg-blue-100 text-blue-800";
                  if (suggestion.category?.includes("Safety")) categoryBg = "bg-purple-100 text-purple-800";
                  if (suggestion.category?.includes("Cost")) categoryBg = "bg-emerald-100 text-emerald-800";

                  return (
                    <tr key={suggestion._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">#{suggestion._id.substring(suggestion._id.length - 6).toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{new Date(suggestion.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{suggestion.author?.name}</div>
                        <div className="text-xs text-gray-500">NIK: {suggestion.author?.nik}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{suggestion.department?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryBg}`}>
                          {suggestion.category} (+{suggestion.pointsAwarded || 0} pts)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                          {suggestion.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/suggestions/${suggestion._id}`} className="p-2 text-gray-400 hover:text-primary transition-colors inline-block">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">No suggestions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {suggestions.length} results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-white bg-primary transition-colors">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
