# Project Brief: Suggestion System (SS)
## Sistem Digitalisasi Kategori Ide & Manajemen Gamifikasi Performa (v2.0)

---

### 1. Latar Belakang & Masalah
Di lingkungan industri dan korporat, inovasi serta efisiensi operasional sangat bergantung pada kontribusi aktif dari karyawan di lapangan. Saat ini, proses pengajuan ide perbaikan, sumbang saran, atau gerakan **Kaizen / Continuous Improvement (CI)** masih menghadapi beberapa kendala taktis:
* **Proses Manual & Fragmented:** Pengajuan masih berbasis form kertas atau Google Form terpisah yang tidak terintegrasi.
* **Pelacakan Terhambat:** Karyawan kesulitan mengetahui status ide yang diajukan (apakah sedang ditinjau, disetujui, atau ditolak).
* **Beban Administrasi Tinggi:** Tim HRD atau Admin SS membutuhkan waktu lama untuk merekap data, melakukan penilaian, dan menghitung reward secara manual.
* **Ketiadaan Metrik Keterlibatan (Engagement):** Belum adanya sistem rekonsiliasi performa kontribusi otomatis antar-departemen untuk mendorong budaya inovasi yang kompetitif.

**Solusi:** Membangun platform digital penampung saran terintegrasi guna mendokumentasikan, menyaring, mengeksekusi ide perbaikan, serta menyajikan kalkulasi performa (gamifikasi skor) secara transparan.

---

### 2. Alur Pengguna (User Flow) Utama
Sistem ini dirancang untuk menjembatani komunikasi terstruktur antar tiga peran utama di dalam perusahaan:

| Peran (Role) | Tanggung Jawab & Alur Kerja dalam Sistem |
| :--- | :--- |
| **Pengusul (Karyawan)** | Mengisi form saran digital, mengunggah bukti visual (Kondisi *Before* vs *After*), serta melihat perolehan poin pribadi/departemennya. |
| **Atasan / Reviewer** <br>*(Section / Dept Head)* | Menerima notifikasi otomatis, melakukan verifikasi kelayakan ide di lapangan, melakukan approval (*Approve/Reject*), dan melakukan validasi klasifikasi bobot poin. |
| **Admin SS** <br>*(HRD / Management)* | Mengelola rekapitulasi seluruh ide, memantau dampak efisiensi, serta mengawasi *Leaderboard Score* performa departemen secara real-time. |

---

### 3. Sistem Gamifikasi & Logika Perhitungan Skor
Untuk mendorong tingkat partisipasi karyawan, sistem ini menerapkan fitur akumulasi poin otomatis yang terbagi ke dalam dua struktur kalkulasi utama:

#### 3.1. Logika Skor per Departemen
Poin departemen dihitung secara kumulatif dari total aktivitas seluruh anggota karyawan yang berada di bawah naungan departemen tersebut. Pembagian bobot skor diatur sebagai berikut:
* **Poin Partisipasi (Pengajuan Awal):** Setiap kali karyawan berhasil mengirimkan (*submit*) ide saran baru, departemen bersangkutan otomatis mendapatkan nilai dasar sebesar **+5 / +10 Poin**.
* **Poin Kualitas (Persetujuan & Dampak):** Ketika ide saran dinyatakan valid dan disetujui (*Approved / Implemented*) oleh penguji, departemen akan mendapatkan poin tambahan yang disesuaikan dengan kategori dampaknya:
    * Kategori *Safety / 5S / Lingkungan*: **+20 Poin** per ide.
    * Kategori *Quality / Product Improvement*: **+30 Poin** per ide.
    * Kategori *Cost Down / Efisiensi Biaya Operasional*: **+50 Poin** per ide.

#### 3.2. Logika Skor Keseluruhan (Company-Wide Leaderboard)
Skor Keseluruhan dihitung berdasarkan total agregasi poin departemen global. Data dikelompokkan (*Grouped*) dan disajikan dalam bentuk peringkat interaktif pada dashboard manajemen. Metrik utama meliputi:
* **Leaderboard Departemen:** Ranking performa keaktifan inovasi bulanan/tahunan antar departemen untuk memicu kompetisi sehat.
* **Poin Akumulasi Perusahaan:** Metrik agregat seluruh poin dari semua departemen guna melacak total pencapaian target inovasi korporat.

---

### 4. Arsitektur Data & Implementasi Sistem
Secara teknis, perolehan skor ini diwujudkan lewat penyesuaian fungsional pada sisi backend dan database relasional:
* **Database Schema:** Tabel `Suggestions` dilengkapi field `status` (enum/string), `category` (string), dan `points` (integer).
* **Backend Controller & Webhooks:** Trigger otomatis yang akan mengisi / memperbarui kolom `points` saat status berganti menjadi *Approved* berdasarkan kondisi kondisional kategori ide.
* **Frontend Queries:** Agregasi data real-time menggunakan fungsi agregat SQL (seperti `SUM(points)` yang digabungkan dengan klausa `GROUP BY department_id ORDER BY total_points DESC`).

---

### 5. Fitur Utama (Minimum Viable Product - MVP)
* **Form Input Saran Terstruktur:** Formulir otomatis (Nama, NIK, Departemen), kategori saran, akar masalah, dan usulan solusi.
* **Dokumentasi Visual (Before-After Picture):** Fitur wajib unggah berkas foto kondisi sebelum dan sesudah perbaikan lapangan.
* **Engine Alur Persetujuan (Approval Workflow):** Logika distribusi notifikasi approval otomatis ke email/dashboard atasan terkait.
* **Dasbor Transparansi Status & Skor:** Halaman pelacakan status ide real-time lengkap dengan komponen visual *Leaderboard Performa* departemen.

---