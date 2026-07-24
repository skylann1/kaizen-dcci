/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Profile from "@/types/profile";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  CreditCard,
  Building2,
  Shield,
  Calendar,
  Award,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Star,
  TrendingUp,
  Camera,
  Edit2
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [ profile, setProfile ] = useState<Profile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [mySuggestions, setMySuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Change Password States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProfilePic, setEditProfilePic] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string>("");
  const [editError, setEditError] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch Dashboard Stats
      fetch("/api/dashboard/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(console.error);

      // Fetch profile data
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(console.error);

      // Fetch All Suggestions and filter for this user
      fetch("/api/suggestions")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const mine = data.filter(
              (s: any) =>
                s.author?._id === session?.user?.id ||
                s.author?.username === session?.user?.username,
            );
            setMySuggestions(
              mine.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              ),
            );
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session?.user;
  const points = stats?.personalPoints || 0;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Derived Stats
  const totalSubmitted = mySuggestions.length;
  const totalApproved = mySuggestions.filter(
    (s) => s.status === "Approved",
  ).length;
  const totalPending = mySuggestions.filter(
    (s) => s.status === "Pending" || s.status === "Review",
  ).length;
  const totalRejected = mySuggestions.filter(
    (s) => s.status === "Rejected",
  ).length;
  const approvalRate =
    totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;

  // Determine Rank based on points
  let rank = {
    name: "Rookie",
    icon: Star,
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };
  if (points >= 1000)
    rank = {
      name: "Legend",
      icon: Award,
      color: "text-yellow-600",
      bg: "bg-gradient-to-br from-yellow-100 to-amber-100",
      border: "border-yellow-300",
    };
  else if (points >= 500)
    rank = {
      name: "Expert",
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-100",
      border: "border-purple-200",
    };
  else if (points >= 200)
    rank = {
      name: "Pro",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    };
  else if (points >= 50)
    rank = {
      name: "Active",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
    };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Password successfully updated.");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      } else {
        setPasswordError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setIsEditLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", editName);
      if (editProfilePic) {
        formData.append("profilePicture", editProfilePic);
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: formData, // do not set Content-Type for FormData
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setIsEditModalOpen(false);
        // Refresh session if name was updated (optional, but good practice)
      } else {
        setEditError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditProfilePic(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER SECTION (Banner & Main Info) */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
        <div className="h-40 sm:h-48 bg-[url('/assets/pt_dharma_controlcable_indonesia_cover.jpeg')] bg-cover bg-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-display font-bold text-5xl shadow-xl z-10 shrink-0 relative overflow-hidden">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile Picture" 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  getInitials(profile?.name || user?.name || "")
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                <button
                  onClick={() => {
                    setEditName(profile?.name || user?.name || "");
                    setEditPreview(profile?.profilePicture || "");
                    setEditProfilePic(null);
                    setEditError("");
                    setIsEditModalOpen(true);
                  }}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity z-20"
                >
                  <Camera className="w-8 h-8" />
                </button>
              </div>
              <div
                className={`absolute -bottom-2 -right-2 ${rank.bg} ${rank.border} border-2 ${rank.color} p-2 rounded-full shadow-lg z-30`}
                title={`Rank: ${rank.name}`}
              >
                <rank.icon className="w-6 h-6" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h1 className="text-3xl font-bold font-display text-slate-800 flex items-center gap-2">
                  {profile?.name || user?.name}
                  <button 
                    onClick={() => {
                      setEditName(profile?.name || user?.name || "");
                      setEditPreview(profile?.profilePicture || "");
                      setEditProfilePic(null);
                      setEditError("");
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border`}
                >
                  {profile?.role.name}
                </span>
              </div>
              <p className="text-base font-medium text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                <Building2 className="w-4 h-4" /> {profile?.department.name || "-"}
              </p>
            </div>

            <div className="pb-2 hidden sm:flex flex-col items-end gap-2">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-yellow-500/30 transform hover:scale-105 transition-transform">
                <Award className="w-8 h-8 opacity-90" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold font-display leading-none">
                    {points}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Employee Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Employee Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      NIK
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">
                      {profile?.nik || "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Username / Email
                    </p>
                    <p
                      className="text-sm font-bold text-slate-700 mt-0.5 truncate max-w-[120px]"
                      title={profile?.email}
                    >
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account & Permissions */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-gray-100 pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> System Account
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Current Rank
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${rank.color}`}>
                      {rank.name}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Member Since
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTICS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-3xl font-display font-bold text-slate-800">
            {totalSubmitted}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            Total Ide
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-3xl font-display font-bold text-slate-800">
            {totalApproved}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            Disetujui
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-3xl font-display font-bold text-slate-800">
            {totalPending}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            Pending / Review
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-3xl font-display font-bold text-slate-800">
            {approvalRate}%
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            Success Rate
          </p>
        </div>
      </div>

      {/* MY SUGGESTIONS HISTORY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
            <span className="text-primary">📋</span> Riwayat Ide Saya
          </h3>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {totalSubmitted} Ide
          </span>
        </div>

        <div className="space-y-4">
          {mySuggestions.length > 0 ? (
            mySuggestions.map((item: any) => {
              let statusColor = "text-blue-600 bg-blue-50 border-blue-200";
              let statusIcon = <Clock className="w-3 h-3 mr-1" />;

              if (item.status === "Approved") {
                statusColor =
                  "text-emerald-700 bg-emerald-50 border-emerald-200";
                statusIcon = <CheckCircle className="w-3 h-3 mr-1" />;
              } else if (item.status === "Rejected") {
                statusColor = "text-red-700 bg-red-50 border-red-200";
                statusIcon = <XCircle className="w-3 h-3 mr-1" />;
              } else if (item.status === "Revision") {
                statusColor = "text-amber-700 bg-amber-50 border-amber-200";
                statusIcon = <FileText className="w-3 h-3 mr-1" />;
              }

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all gap-4 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-100 group-hover:bg-primary transition-colors"></div>
                  <div className="pl-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        #{item._id.substring(item._id.length - 6).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}
                      >
                        {statusIcon}
                        {item.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 max-w-3xl leading-relaxed">
                      {item.problem}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center sm:min-w-[140px]">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Tanggal
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-base font-bold text-slate-700 mb-1">
                Belum ada ide yang diajukan
              </h4>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Anda belum pernah membuat usulan / ide perbaikan. Yuk, mulai
                buat usulan pertama Anda sekarang!
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-slate-800">Change Password</h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                <input 
                  type="password" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <input 
                  type="password" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              
              {passwordError && <p className="text-red-500 text-xs font-bold">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-600 text-xs font-bold p-2 bg-green-50 rounded-lg">{passwordSuccess}</p>}
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isPasswordLoading}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPasswordLoading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditProfile} className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                  {editPreview ? (
                    <img src={editPreview} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                    </label>
                  </div>
                </div>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatar-upload" className="text-sm font-bold text-primary mt-3 cursor-pointer hover:underline">
                  Change Photo
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              
              {editError && <p className="text-red-500 text-xs font-bold">{editError}</p>}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isEditLoading}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isEditLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
