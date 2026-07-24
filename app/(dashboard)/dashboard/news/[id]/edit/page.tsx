"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Newspaper, Save, ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Lainnya");
  const [statusVal, setStatusVal] = useState("Draft");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteCoverImage, setDeleteCoverImage] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "Admin" && !session.user.permissions?.canManageSystem && !session.user.permissions?.canManageNews)) {
      router.push("/dashboard/news");
      return;
    }

    if (params.id) {
      fetch(`/api/news/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(data => {
          setTitle(data.title);
          setContent(data.content);
          setCategory(data.category || "Lainnya");
          setStatusVal(data.status);
          if (data.coverImage) {
            setPreviewUrl(data.coverImage);
          }
        })
        .catch(err => {
          console.error(err);
          router.push("/dashboard/news");
        })
        .finally(() => setIsLoading(false));
    }
  }, [params.id, status, session, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDeleteCoverImage(false);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
    setDeleteCoverImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("status", statusVal);
      
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      if (deleteCoverImage) {
        formData.append("deleteCoverImage", "true");
      }

      const res = await fetch(`/api/news/${params.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard/news");
      } else {
        alert("Gagal memperbarui berita.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/news" className="p-2 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Edit Berita
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Cover Image</label>
          {previewUrl ? (
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-white shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500 font-medium"><span className="font-bold text-primary">Klik untuk upload</span> atau drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG or JPEG (Max. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Category & Title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Berita *</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-medium"
              placeholder="Masukkan judul berita yang menarik..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-medium"
            >
              <option value="Pengumuman">Pengumuman</option>
              <option value="Event">Event</option>
              <option value="Update Sistem">Update Sistem</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Isi Konten *</label>
          <RichTextEditor 
            value={content}
            onChange={setContent}
            placeholder="Tuliskan isi berita Anda yang menarik di sini..."
          />
        </div>

        {/* Status & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Status:</label>
            <select
              value={statusVal}
              onChange={e => setStatusVal(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Publish</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !title || !content}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <><Save className="w-4 h-4" /> Update Berita</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
