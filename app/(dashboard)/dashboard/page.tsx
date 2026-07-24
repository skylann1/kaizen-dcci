"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, FileText, CheckCircle, TrendingUp, Megaphone, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.slice(0, 3)))
      .catch((err) => console.error(err));

    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));

    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActiveAnnouncements(data.filter(a => a.isActive));
        }
      })
      .catch((err) => console.error(err));

    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err));

    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentNews(data.slice(0, 2)); // Ambil 2 berita terbaru
        }
        setIsNewsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsNewsLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* ANNOUNCEMENTS BANNER */}
      {activeAnnouncements.length > 0 && (
        <div className="space-y-3">
          {activeAnnouncements.map(ann => (
            <div key={ann._id} className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
              ann.type === 'INFO' ? 'bg-blue-50 border-blue-100 text-blue-800' :
              ann.type === 'SUCCESS' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              ann.type === 'WARNING' ? 'bg-orange-50 border-orange-100 text-orange-800' :
              'bg-red-50 border-red-100 text-red-800'
            }`}>
              <Megaphone className={`w-5 h-5 shrink-0 mt-0.5 ${
                ann.type === 'INFO' ? 'text-blue-600' :
                ann.type === 'SUCCESS' ? 'text-emerald-600' :
                ann.type === 'WARNING' ? 'text-orange-600' : 'text-red-600'
              }`} />
              <div>
                <h4 className="font-bold text-sm">{ann.title}</h4>
                <p className="text-xs mt-1 opacity-90">{ann.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WELCOME BANNER */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-white shadow-sm border border-indigo-100 flex flex-col md:flex-row items-center justify-between p-6 sm:p-10">
        <div className="z-10 flex-1 text-slate-800 mb-6 md:mb-0 md:pr-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold uppercase tracking-wide leading-tight text-slate-900">
            Selamat Datang, {session?.user?.name || "Admin"}
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-primary uppercase mt-1 mb-4">
            DCCI Suggestion System
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
            Dashboard DCCI Suggestion System membantu Anda untuk memantau, menyetujui, dan merekap seluruh ide perbaikan dari setiap departemen. Sistem ini mempermudah pelacakan status ide dan perhitungan leaderboard secara real-time.
          </p>
        </div>
        <div className="relative w-full md:w-1/3 h-48 sm:h-56 flex-shrink-0 z-10">
          <Image 
            src="/assets/undraw/undraw_coffee-with-friends_ocg2.svg" 
            alt="Welcome Illustration" 
            fill
            className="object-contain md:object-right-bottom"
            priority
          />
        </div>
      </div>

      {/* RECENT NEWS BANNER (If any) */}
      {isNewsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="w-16 h-3 bg-gray-200 rounded-full"></div>
                <div className="w-full h-4 bg-gray-200 rounded-full"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recentNews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {recentNews.map(item => (
            <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              {item.coverImage ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-blue-50 text-blue-300 flex items-center justify-center shrink-0">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-2">
                  <a href={`/dashboard/news/${item._id}`} className="hover:text-primary transition-colors">{item.title}</a>
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROW 1: TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Reward And Score */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🏅</span>
            </div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-1">My Points</h3>
            <p className="text-3xl font-bold text-yellow-400 font-display">{stats ? stats.personalPoints : '...'} <span className="text-sm text-yellow-400/70 font-sans">pts</span></p>
          </div>
        </div>

        {/* Cost Impact */}
        {session?.user?.permissions?.canViewDashboard && (
          <div className="bg-emerald-600 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -bottom-4 -right-4 p-4 opacity-10">
              <DollarSign className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 text-white">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-1">Total Cost Saved</h3>
              <p className="text-xl md:text-2xl font-bold text-white font-display truncate">
                {analytics ? formatCurrency(analytics.overview.totalImpact) : '...'}
              </p>
            </div>
          </div>
        )}

        {/* Department Leaderboard */}
        {session?.user?.permissions?.canViewDashboard && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col lg:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Top Departments
              </h3>
            </div>
            <div className="space-y-2 flex-1">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, index) => {
                  const colors = ["bg-yellow-100 text-yellow-700", "bg-gray-100 text-gray-600", "bg-orange-100 text-orange-700"];
                  return (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors[index] || "bg-blue-100 text-blue-700"}`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{item.totalPoints} pts</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 mt-4 text-center">Loading leaderboard...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ROW 2: ADVANCED ANALYTICS */}
      {session?.user?.permissions?.canViewDashboard && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Tren Usulan (6 Bulan Terakhir)
            </h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="Usulan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Status Usulan
            </h3>
            <p className="text-xs text-gray-500 mb-6">Total: {analytics.overview.totalSuggestions} ide</p>
            
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {analytics.status.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                {analytics.status.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }}></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-600">{s.name}</p>
                      <p className="text-sm font-bold text-slate-900">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ROW 3: RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-slate-800 font-display flex items-center gap-2 mb-6">
          <span className="text-orange-500">📋</span> Ide Terakhir Saya
        </h3>
        
        <div className="space-y-3">
          {stats?.myRecentSuggestions?.length > 0 ? (
            stats.myRecentSuggestions.map((item: any) => {
              let color = "text-blue-500";
              let bg = "bg-blue-50";
              if (item.status === "Approved") { color = "text-emerald-600"; bg = "bg-emerald-50"; }
              if (item.status === "Rejected") { color = "text-red-600"; bg = "bg-red-50"; }
              if (item.status === "Revision") { color = "text-amber-600"; bg = "bg-amber-50"; }
              
              return (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold font-mono text-gray-500">{item._id.substring(item._id.length - 8).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${color}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.problem}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs font-bold text-primary mt-1">{item.category}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Anda belum mengirimkan ide apapun.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
