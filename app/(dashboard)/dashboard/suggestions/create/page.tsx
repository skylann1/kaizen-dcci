"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  UploadCloud, 
  Info, 
  Save,
  Send,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateSuggestionPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [costEffectiveExplanation, setCostEffectiveExplanation] = useState("");
  const [costEffectiveNominal, setCostEffectiveNominal] = useState("");
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);

  // Departments State
  const [departments, setDepartments] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/departments")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error(err));
  }, []);

  // Prevent default behavior for drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/suggestions"
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-display">Buat Suggestion</h1>
            <p className="text-gray-500 text-sm">Sampaikan ide perbaikanmu untuk perusahaan.</p>
          </div>
        </div>
      </div>

      {/* Main Form Form */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("department", departmentId);
        formData.append("problem", problem);
        formData.append("solution", solution);
        formData.append("costEffectiveExplanation", costEffectiveExplanation);
        formData.append("costEffectiveNominal", costEffectiveNominal);
        if (beforeImage) formData.append("beforeImage", beforeImage);
        if (afterImage) formData.append("afterImage", afterImage);

        try {
          const res = await fetch("/api/suggestions", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            router.push("/dashboard/suggestions");
          } else {
            alert("Gagal mengirim suggestion");
          }
        } catch (error) {
          console.error(error);
          alert("Terjadi kesalahan");
        } finally {
          setIsSubmitting(false);
        }
      }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Progress / Info Banner */}
        <div className="bg-blue-50/50 border-b border-blue-100 p-4 md:p-6 flex items-start gap-3">
           <div className="mt-0.5 text-blue-600">
              <Info className="w-5 h-5" />
           </div>
           <div>
              <h3 className="font-bold text-blue-900 text-sm">Panduan Pengisian</h3>
              <p className="text-blue-700/80 text-sm mt-1">Pastikan judul singkat dan jelas. Deskripsikan kondisi saat ini (masalah) dan solusi yang Anda tawarkan serinci mungkin. Lampirkan foto Before-After jika ada untuk mempermudah proses review.</p>
           </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
              Informasi Dasar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Judul Ide <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: Penggantian Lampu Gudang ke LED"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  <option value="Safety / 5S / Lingkungan">Safety / 5S / Lingkungan</option>
                  <option value="Quality / Product Improvement">Quality / Product Improvement</option>
                  <option value="Cost Down / Efisiensi Biaya Operasional">Cost Down / Efisiensi Biaya Operasional</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Departemen Tujuan <span className="text-red-500">*</span></label>
                <select 
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Pilih Departemen...</option>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Improvement */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
              Detail Suggestion
            </h3>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span>Kondisi Saat Ini (Masalah) <span className="text-red-500">*</span></span>
                </label>
                <textarea 
                  rows={4}
                  placeholder="Jelaskan kondisi atau masalah yang terjadi saat ini..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  required
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span>Solusi yang Diusulkan <span className="text-red-500">*</span></span>
                </label>
                <textarea 
                  rows={4}
                  placeholder="Jelaskan ide perbaikan atau solusi yang Anda tawarkan..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  required
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span>Alasan Hemat Biaya (Cost Effective) <span className="text-gray-400 font-normal text-xs">(Opsional)</span></span>
                </label>
                <textarea 
                  rows={3}
                  placeholder="Mengapa usulan ini menghemat biaya?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  value={costEffectiveExplanation}
                  onChange={(e) => setCostEffectiveExplanation(e.target.value)}
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                  <span>Estimasi Penghematan (Rp) <span className="text-gray-400 font-normal text-xs">(Opsional)</span></span>
                </label>
                <input 
                  type="number" 
                  placeholder="Contoh: 500000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={costEffectiveNominal}
                  onChange={(e) => setCostEffectiveNominal(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lampiran Foto */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
              Lampiran Foto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Before Photo */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Foto Kondisi Awal (Before)</label>
                <label 
                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrag}
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">{beforeImage ? beforeImage.name : "Ambil Foto Langsung"}</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
                  <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setBeforeImage(e.target.files[0]);
                  }} />
                </label>
              </div>

              {/* After Photo */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Foto Sesudah Perbaikan (After)</label>
                <label 
                  className="cursor-pointer border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all"
                >
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">{afterImage ? afterImage.name : "Ambil Foto Langsung"}</p>
                  <p className="text-xs text-gray-500">Bisa di-upload menyusul (Opsional)</p>
                  <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setAfterImage(e.target.files[0]);
                  }} />
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4">
           <button 
             type="button"
             className="w-full md:w-auto px-6 py-3 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
           >
              Batal
           </button>
           <button 
             type="button"
             className="w-full md:w-auto px-6 py-3 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
           >
              <Save className="w-4 h-4" />
              Simpan Draft
           </button>
           <button 
             type="submit"
             disabled={isSubmitting}
             className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
           >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Mengirim..." : "Ajukan Suggestion"}
           </button>
        </div>

      </form>
    </div>
  );
}
