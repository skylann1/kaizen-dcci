"use client";

import React from "react";
import { 
  Search, 
  Lightbulb, 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  TrendingDown,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Image from "next/image";

export default function GuidancePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* HEADER / HERO SECTION */}
      <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-16">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-12">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-6 border border-blue-100 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Panduan Sistem
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 font-display tracking-tight mb-6">
              Cara Membuat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Suggestion</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Berikan dampak nyata untuk perusahaan! Ikuti tiga langkah sederhana di bawah ini untuk mengajukan ide perbaikan, memecahkan masalah, dan mengumpulkan poin reward.
            </p>
          </div>
          <div className="flex-1 flex justify-center w-full max-w-sm md:max-w-md">
            <Image 
              src="/assets/undraw/undraw_video-tutorial_ly8k.svg" 
              alt="Guidance Illustration" 
              width={400} 
              height={300} 
              className="w-full h-auto drop-shadow-sm hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: WORKFLOW STEPS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-16 relative">
        
        {/* Connecting Line for Desktop */}
        <div className="hidden md:block absolute top-[140px] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-100 via-amber-100 to-emerald-100 z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-100/50 border border-blue-50 group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Search className="w-12 h-12 text-blue-600 relative z-10" />
            </div>
            <div className="bg-blue-100 text-blue-700 font-black text-xs px-3 py-1 rounded-full mb-4">LANGKAH 1</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Temukan Masalah</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Identifikasi inefisiensi atau bahaya di area kerja. Ambil foto kondisi saat ini (Before) sebagai bukti visual.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-amber-100/50 border border-amber-50 group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Lightbulb className="w-12 h-12 text-amber-500 relative z-10" />
            </div>
            <div className="bg-amber-100 text-amber-700 font-black text-xs px-3 py-1 rounded-full mb-4">LANGKAH 2</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Ajukan Solusi</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Isi formulir pengajuan dengan usulan solusi Anda. Lampirkan sketsa atau foto hasil perbaikan (After).
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-100/50 border border-emerald-50 group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Award className="w-12 h-12 text-emerald-500 relative z-10" />
            </div>
            <div className="bg-emerald-100 text-emerald-700 font-black text-xs px-3 py-1 rounded-full mb-4">LANGKAH 3</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Dapatkan Poin</h3>
            <p className="text-sm text-gray-500 leading-relaxed px-4">
              Setelah disetujui, poin reward akan otomatis masuk ke Total Skor Leaderboard Departemen Anda!
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 2: CATEGORY & POINTS */}
      <div className="bg-slate-800 rounded-3xl p-10 md:p-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
        
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight mb-4">
            Sistem Penilaian Baru (Maks 100 Poin)
          </h2>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg">
            Setiap ide yang disetujui tidak lagi menggunakan poin kaku. Atasan akan menilai secara adil menggunakan rubrik <b>Kolom Penilaian</b> yang terdiri dari kualitas proposal dan dampak SQCDME.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Card 1: Kolom Penilaian 1 */}
          <div className="bg-slate-700/50 backdrop-blur-md rounded-2xl p-8 border border-slate-600 hover:bg-slate-700 transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-blue-400" />
              </div>
              <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black text-sm px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                Max 60 Pts
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Kualitas Proposal</h3>
            <ul className="text-slate-300 leading-relaxed text-sm space-y-2 list-disc list-inside">
              <li><b>Level Proposal:</b> Tingkat kemandirian dalam pembuatan tema (Max 20)</li>
              <li><b>Keaslian Tema:</b> Kreativitas dan keunikan ide perbaikan (Max 20)</li>
              <li><b>Pengembangan Ide:</b> Potensi penerapan horizontal di area lain (Max 20)</li>
            </ul>
          </div>

          {/* Card 2: Kolom Penilaian 2 */}
          <div className="bg-slate-700/50 backdrop-blur-md rounded-2xl p-8 border border-slate-600 hover:bg-slate-700 transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Max 40 Pts
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Dampak SQCDME</h3>
            <p className="text-slate-300 leading-relaxed text-sm mb-3">
              Kombinasi total poin dari dampak perbaikan terhadap operasional, yang dibagi ke dalam 6 variabel utama:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-emerald-100 font-medium">
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">S - Safety</div>
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">D - Delivery</div>
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">Q - Quality</div>
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">M - Moral</div>
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">C - Cost</div>
              <div className="bg-slate-800/50 p-2 rounded text-center border border-slate-600">E - Environment</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
