"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  User, 
  Calendar,
  Building2,
  Award,
  Send,
  MoreVertical,
  ThumbsUp,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuggestionDetailPage() {
  const params = useParams();
  const suggestionId = params?.id as string;
  
  const { data: session } = useSession();
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setSuggestion((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment]
        }));
        setCommentText("");
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (!suggestionId) return;

    let isMounted = true;

    const fetchSuggestion = async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      try {
        // Tambahkan cache: 'no-store' agar browser tidak menggunakan cache lama
        const res = await fetch(`/api/suggestions/${suggestionId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (isMounted) {
          setSuggestion(data);
          if (showLoading) setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch suggestion:", err);
        if (isMounted && showLoading) setIsLoading(false);
      }
    };

    // Initial fetch with loading state
    fetchSuggestion(true);

    // Polling every 3 seconds for realtime updates
    const intervalId = setInterval(() => {
      fetchSuggestion(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [suggestionId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
        <p className="text-gray-500 font-medium animate-pulse">Loading detail...</p>
      </div>
    );
  }

  if (!suggestion || suggestion.error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-red-500 font-medium">Suggestion not found or an error occurred.</p>
        <Link href="/dashboard/suggestions" className="text-blue-500 underline">Back to Suggestions</Link>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    Pending: { color: "text-amber-700", bg: "bg-amber-100", icon: Clock, label: "Menunggu Review" },
    Approved: { color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle, label: "Disetujui" },
    Rejected: { color: "text-red-700", bg: "bg-red-100", icon: XCircle, label: "Ditolak" },
    Revision: { color: "text-blue-700", bg: "bg-blue-100", icon: AlertCircle, label: "Revisi" }
  };

  const currentStatus = statusConfig[suggestion.status] || statusConfig.Pending;
  const StatusIcon = currentStatus.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/suggestions"
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight font-display">
                {suggestion.title}
              </h1>
              <span className={`px-3 py-1 ${currentStatus.bg} ${currentStatus.color} text-xs font-bold rounded-full flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" /> {currentStatus.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium flex items-center gap-4">
              <span>ID: <span className="font-bold text-slate-700">#{suggestion._id.substring(suggestion._id.length - 6).toUpperCase()}</span></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-500" /> +{suggestion.pointsAwarded || 0} Poin</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            Print Laporan
          </button>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detail Masalah & Solusi */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Kategori</p>
                <p className="text-sm font-bold text-slate-800 line-clamp-1" title={suggestion.category}>{suggestion.category.split('/')[0].trim()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Departemen</p>
                <p className="text-sm font-bold text-slate-800">{suggestion.department?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Tanggal Pengajuan</p>
                <p className="text-sm font-bold text-slate-800">{formatDate(suggestion.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Status Validasi</p>
                <p className="text-sm font-bold text-slate-800">{suggestion.status === "Approved" ? "Disetujui" : (suggestion.status === "Pending" ? "Menunggu" : suggestion.status)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Kondisi Saat Ini (Masalah)</h3>
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {suggestion.problem}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Solusi yang Diusulkan</h3>
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {suggestion.solution}
              </div>
            </div>

            {(suggestion.costEffective?.explanation || suggestion.costEffective?.nominal > 0) && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800">Efisiensi Biaya (Cost Effective)</h3>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {suggestion.costEffective?.nominal > 0 && (
                    <div className="mb-2 font-bold text-blue-800">
                      Estimasi Hemat: Rp {suggestion.costEffective.nominal.toLocaleString('id-ID')}
                    </div>
                  )}
                  {suggestion.costEffective?.explanation && (
                    <p>{suggestion.costEffective.explanation}</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Before & After Photos */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-slate-800 mb-6">Dokumentasi Visual (Before / After)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Before */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">BEFORE</span>
                </div>
                <div className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                  {suggestion.images?.before ? (
                    <img src={suggestion.images.before} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <span className="text-4xl">📷</span>
                      <span className="text-xs mt-2 font-medium">Tidak ada foto before</span>
                    </div>
                  )}
                </div>
              </div>

              {/* After */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">AFTER</span>
                </div>
                <div className="aspect-video bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative group">
                  {suggestion.images?.after ? (
                    <img src={suggestion.images.after} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <span className="text-4xl">📷</span>
                      <span className="text-xs mt-2 font-medium">Tidak ada foto after</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Info Pengaju */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3">Informasi Pengaju</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg font-display">
                {getInitials(suggestion.author?.name)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{suggestion.author?.name || "Unknown User"}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" /> NIK: {suggestion.author?.nik || "-"}</p>
              </div>
            </div>
          </div>

          {/* Timeline Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3">Status Timeline</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              {suggestion.status === "Approved" && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-white border border-gray-100 shadow-sm ml-4 md:ml-0">
                    <p className="font-bold text-slate-800 text-sm">Disetujui</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(suggestion.updatedAt)}</p>
                  </div>
                </div>
              )}

              {suggestion.status === "Rejected" && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-red-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-white border border-gray-100 shadow-sm ml-4 md:ml-0">
                    <p className="font-bold text-slate-800 text-sm">Ditolak</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(suggestion.updatedAt)}</p>
                  </div>
                </div>
              )}

              {/* Step: Diajukan */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-white border border-gray-100 shadow-sm ml-4 md:ml-0">
                  <p className="font-bold text-slate-800 text-sm">Ide Diajukan</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(suggestion.createdAt)}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Kolom Diskusi / Komentar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Diskusi & Catatan
              </h3>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {!suggestion.comments || suggestion.comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Belum ada diskusi untuk suggestion ini.</p>
                </div>
              ) : (
                suggestion.comments.map((comment: any, idx: number) => {
                  const isSelf = session?.user?.id === comment.author?._id;
                  return (
                    <div key={idx} className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelf ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {getInitials(comment.author?.name)}
                      </div>
                      <div className={isSelf ? 'text-right' : ''}>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${isSelf ? 'bg-primary text-white rounded-tr-none text-left' : 'bg-white border border-gray-100 text-slate-700 rounded-tl-none'}`}>
                          {comment.text}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-1 ${isSelf ? 'mr-1' : 'ml-1'}`}>
                          {comment.author?.name} • {new Date(comment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Chat */}
            <form onSubmit={handleSubmitComment} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis komentar..."
                disabled={isSubmittingComment}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isSubmittingComment || !commentText.trim()} 
                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
