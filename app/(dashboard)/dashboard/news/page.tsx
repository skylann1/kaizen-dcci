"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Newspaper, Clock, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";

export default function NewsPage() {
  const { data: session } = useSession();
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const canManageNews = session?.user?.role === "Admin" || session?.user?.permissions?.canManageSystem || session?.user?.permissions?.canManageNews;

  const fetchNews = async () => {
    try {
      const url = canManageNews ? "/api/news?all=true" : "/api/news";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNews(data);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNews();
    }
  }, [session, canManageNews]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news?")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNews(prev => prev.filter(n => n._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-primary" />
            Company News
          </h1>
          <p className="text-sm text-gray-500 mt-1">Berita terbaru dan update seputar perusahaan.</p>
        </div>
        
        {canManageNews && (
          <Link 
            href="/dashboard/news/create"
            className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Buat Berita
          </Link>
        )}
      </div>

      {news.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum Ada Berita</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">Saat ini belum ada berita atau artikel yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(item => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative">
              
              {canManageNews && (
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/dashboard/news/${item._id}/edit`}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Link href={`/dashboard/news/${item._id}`} className="flex flex-col h-full">
                <div className="relative h-48 bg-gray-100 w-full shrink-0">
                  {item.coverImage ? (
                    <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Newspaper className="w-12 h-12" />
                    </div>
                  )}
                  {item.status === "Draft" && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-sm">
                      DRAFT
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{item.category || "Lainnya"}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  <div className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') }}>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {item.author?.profilePicture ? (
                        <img src={item.author.profilePicture} alt={item.author.name} className="w-full h-full object-cover" />
                      ) : (
                        item.author?.name ? item.author.name.substring(0,2).toUpperCase() : "AD"
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{item.author?.name || "Admin"}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
