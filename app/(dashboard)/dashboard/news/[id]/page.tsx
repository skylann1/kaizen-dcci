"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User, Newspaper, ThumbsUp, MessageSquare, Send } from "lucide-react";
import { useSession } from "next-auth/react";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [news, setNews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/news/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(data => setNews(data))
        .catch(err => {
          console.error(err);
          router.push("/dashboard/news");
        })
        .finally(() => setIsLoading(false));
    }
  }, [params.id, router]);

  const handleLike = async () => {
    if (!session || isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`/api/news/${params.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setNews((prev: any) => ({
          ...prev,
          likes: data.hasLiked 
            ? [...prev.likes, session.user.id] 
            : prev.likes.filter((id: string) => id !== session.user.id)
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const res = await fetch(`/api/news/${params.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const newComment = await res.json();
        setNews((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment]
        }));
        setCommentText("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link 
        href="/dashboard/news" 
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Berita
      </Link>

      <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        
        {/* Cover Image */}
        <div className="relative w-full h-64 md:h-96 bg-gray-100 shrink-0">
          {news.coverImage ? (
            <Image src={news.coverImage} alt={news.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
              <Newspaper className="w-16 h-16" />
              <p className="text-sm font-medium">Tidak ada gambar cover</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10 lg:p-12">
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">{news.category || "Lainnya"}</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(news.publishedAt || news.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Oleh: <span className="text-primary">{news.author?.name || "Admin"}</span>
            </div>
            {news.status === "Draft" && (
              <>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">DRAFT</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-8 font-display">
            {news.title}
          </h1>

          {/* Body */}
          <div 
            className="prose prose-slate prose-lg max-w-none text-slate-700 quill-content border-b border-gray-100 pb-10"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Social Actions */}
          <div className="pt-6 flex items-center gap-6">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 font-bold transition-colors ${news.likes?.includes(session?.user?.id) ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
            >
              <ThumbsUp className={`w-5 h-5 ${news.likes?.includes(session?.user?.id) ? "fill-primary" : ""}`} />
              <span>{news.likes?.length || 0} Suka</span>
            </button>
            <div className="flex items-center gap-2 text-gray-400 font-bold">
              <MessageSquare className="w-5 h-5" />
              <span>{news.comments?.length || 0} Komentar</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-10 bg-slate-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Diskusi</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleComment} className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                {session?.user?.profilePicture ? (
                   <img src={session.user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   session?.user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isCommenting || !commentText.trim()}
                  className="absolute right-2 top-2 p-1.5 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {news.comments?.map((comment: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden">
                    {comment.user?.profilePicture ? (
                       <img src={comment.user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       comment.user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-xl rounded-tl-none border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-sm">{comment.user?.name || "User"}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!news.comments || news.comments.length === 0) && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              )}
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}
