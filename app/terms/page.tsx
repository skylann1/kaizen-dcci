import React from "react";
import Link from "next/link";
import { Shield, FileText, Lock, CheckCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Suggestion System DCCI",
  description: "Syarat dan Ketentuan Penggunaan Suggestion System",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            href="/"
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-right">
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Legal & Kepatuhan</p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">
              Syarat & Ketentuan Penggunaan
            </h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Banner */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Suggestion System DCCI</h2>
            <p className="text-slate-300">Pembaruan Terakhir: 14 Juli 2026</p>
          </div>

          <div className="p-8 space-y-10 text-slate-700 leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-slate-800">1. Pendahuluan</h3>
              </div>
              <p>
                Selamat datang di <strong>Suggestion System DCCI</strong>. Platform ini adalah fasilitas internal perusahaan yang dirancang untuk mengumpulkan, mengelola, dan memberikan penghargaan atas ide-ide perbaikan (Kaizen/Continuous Improvement) dari karyawan.
              </p>
              <p>
                Dengan mengakses dan menggunakan sistem ini, Anda menyetujui untuk terikat oleh seluruh Syarat dan Ketentuan yang tercantum di bawah ini. Jika Anda tidak menyetujui ketentuan ini, Anda tidak diperkenankan menggunakan sistem ini.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800">2. Kewajiban & Integritas Pengguna</h3>
              </div>
              <ul className="space-y-3 list-none">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span><strong>Orisinalitas Ide:</strong> Setiap ide (suggestion) yang Anda ajukan haruslah merupakan hasil pemikiran sendiri atau tim Anda, dan bukan merupakan plagiasi dari ide rekan kerja lain yang belum diajukan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span><strong>Kejujuran Data:</strong> Data yang dilampirkan, termasuk deskripsi masalah, solusi, dan bukti foto Before/After tidak boleh dimanipulasi secara digital untuk tujuan mengelabui sistem penilaian.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span><strong>Penggunaan Profesional:</strong> Kolom diskusi dan komentar harus digunakan secara profesional, sopan, dan sesuai dengan etika kerja perusahaan. Dilarang menggunakan kata-kata kasar, diskriminatif, atau tidak pantas.</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <Lock className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-slate-800">3. Hak Kekayaan Intelektual & Kerahasiaan</h3>
              </div>
              <p>
                Semua ide perbaikan, metode operasional, dan data efisiensi yang diajukan dan disetujui melalui sistem ini otomatis menjadi **Hak Milik Perusahaan (DCCI)**. Perusahaan berhak penuh untuk mengimplementasikan, memodifikasi, atau menyebarluaskan metode tersebut ke cabang/departemen lain tanpa kewajiban royalti tambahan kepada pengusul, selain dari sistem *reward* (Gamifikasi Poin) yang telah ditetapkan.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800">
                <strong>Peringatan Kerahasiaan (NDA):</strong> Data operasional, foto mesin, alur kerja, dan rahasia dagang yang diunggah ke dalam sistem ini bersifat **Sangat Rahasia**. Pengguna dilarang keras mengunduh, membagikan, atau menyebarkan data dari sistem ini ke pihak luar (pihak ketiga) melalui media apa pun (termasuk media sosial pribadi). Pelanggaran terhadap kerahasiaan ini dapat berakibat pada sanksi indisipliner hingga tindakan hukum.
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <Award className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-slate-800">4. Sistem Poin & Gamifikasi</h3>
              </div>
              <p>
                Perusahaan menyediakan sistem poin gamifikasi sebagai bentuk apresiasi terhadap partisipasi Anda. Mengenai sistem poin ini, pengguna menyetujui bahwa:
              </p>
              <ul className="space-y-3 list-none">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Poin yang diperoleh tidak dapat ditukar dengan uang tunai (cash) secara langsung, kecuali perusahaan mengadakan program penukaran hadiah resmi (Reward Redemption) pada periode tertentu.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  <span>Keputusan Komite / Atasan dalam hal menyetujui (Approve), menolak (Reject), atau menentukan kategori dampak ide (yang menentukan jumlah poin) bersifat mutlak dan tidak dapat diganggu gugat.</span>
                </li>
              </ul>
            </section>

          </div>
          
          {/* Footer of the card */}
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Dengan login ke aplikasi, Anda dianggap telah membaca dan menyetujui persyaratan ini.
            </p>
            <Link 
              href="/login"
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Just importing Award locally since it was missed in top imports
function Award(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  )
}
