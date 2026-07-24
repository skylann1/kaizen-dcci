"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Trophy, 
  Medal, 
  Award,
  ChevronRight,
  TrendingUp,
  Star
} from "lucide-react";

export default function LeaderboardPage() {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [activeTab, setActiveTab] = useState("users");
  const [period, setPeriod] = useState(currentPeriod);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/leaderboard/users?period=${period}`).then(res => res.json()),
      fetch(`/api/leaderboard?period=${period}`).then(res => res.json())
    ]).then(([usersData, deptData]) => {
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(deptData)) setDepartments(deptData);
      setLoading(false);
    });
  }, [period]);

  const currentData = activeTab === "users" 
    ? users.map((u, i) => ({ id: u._id, name: u.name, subtitle: u.department?.name || "Unknown", points: u.personalPoints, rank: i+1, avatar: u.name.substring(0,2).toUpperCase(), profilePicture: u.profilePicture }))
    : departments.map((d, i) => ({ id: d._id, name: d.name, subtitle: "Department", points: d.totalPoints, rank: i+1, avatar: d.name.substring(0,2).toUpperCase(), profilePicture: null }));



  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg p-8 md:p-12 border border-slate-700">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-amber-400 font-bold text-sm mb-6 border border-slate-700 shadow-sm">
              <Trophy className="w-4 h-4" />
              Reward System
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display tracking-tight mb-4">
              Klasemen
            </h1>
            <p className="text-slate-300 md:text-lg max-w-xl mx-auto md:mx-0">
              Terus kumpulkan poin dari setiap ide brilianmu dan jadilah inovator terbaik!
            </p>
          </div>
          <div className="flex-shrink-0 w-48 md:w-72 hidden sm:block animate-in fade-in zoom-in duration-700">
            <Image 
              src="/assets/undraw/undraw_product-hunt_ip7p.svg" 
              alt="Product Hunt Illustration" 
              width={300} 
              height={200}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* FILTER & TAB NAVIGATION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <label htmlFor="period-select" className="text-sm font-bold text-gray-500">Periode:</label>
          <input 
            type="month" 
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm font-bold text-slate-800 focus:outline-none bg-transparent"
          />
        </div>

        <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "users" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            <Trophy className="w-4 h-4" /> Top Innovators
          </button>
          <button 
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "departments" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            <Award className="w-4 h-4" /> Top Departments
          </button>
        </div>
      </div>

      {/* CONTENT: LEADERBOARD */}
      {(activeTab === "users" || activeTab === "departments") && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-bold">Loading leaderboard...</div>
          ) : currentData.length > 0 ? (
            <>
              {/* PODIUM SECTION */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 pt-16">
                <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 max-w-3xl mx-auto h-auto md:h-64">
                  
                  {/* Rank 2 */}
                  {currentData[1] && (
                    <div className="flex flex-col items-center w-full md:w-1/3 order-2 md:order-1 relative group">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-2xl font-bold font-display shadow-lg border-4 border-slate-100 relative z-10 overflow-hidden">
                        {currentData[1].profilePicture ? (
                           <img src={currentData[1].profilePicture} alt="Avatar" className="object-cover w-full h-full" />
                        ) : (
                           currentData[1].avatar
                        )}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center border-2 border-white text-slate-600 shadow-sm">2</div>
                      </div>
                      <div className="w-full h-24 md:h-32 bg-gradient-to-t from-slate-100 to-slate-50 border-x border-t border-slate-200 rounded-t-2xl mt-4 flex flex-col items-center justify-end pb-4 transition-all group-hover:from-slate-200">
                        <p className="font-bold text-slate-700 text-sm truncate w-full text-center px-2">{currentData[1].name}</p>
                        <p className="text-sm font-black text-slate-500 mt-1">{currentData[1].points} pts</p>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {currentData[0] && (
                    <div className="flex flex-col items-center w-full md:w-1/3 order-1 md:order-2 relative group">
                      <div className="absolute -top-24 md:-top-20 opacity-0 group-hover:-top-28 group-hover:opacity-100 transition-all text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                        MVP Bulan Ini!
                      </div>
                      <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-bold font-display shadow-xl shadow-amber-500/30 border-4 border-white relative z-10 transform md:-translate-y-4 overflow-hidden">
                        {currentData[0].profilePicture ? (
                           <img src={currentData[0].profilePicture} alt="Avatar" className="object-cover w-full h-full" />
                        ) : (
                           currentData[0].avatar
                        )}
                        <div className="absolute -top-4 right-0 transform translate-x-1/4">
                          <Trophy className="w-10 h-10 text-amber-200 drop-shadow-md fill-amber-300" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white text-amber-900 font-black shadow-sm">1</div>
                      </div>
                      <div className="w-full h-32 md:h-44 bg-gradient-to-t from-amber-100 to-amber-50 border-x border-t border-amber-200 rounded-t-2xl mt-4 md:mt-0 flex flex-col items-center justify-end pb-6 transition-all group-hover:from-amber-200">
                        <p className="font-bold text-amber-900 text-base truncate w-full text-center px-2">{currentData[0].name}</p>
                        <p className="text-lg font-black text-amber-600 mt-1 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500" /> {currentData[0].points} pts
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {currentData[2] && (
                    <div className="flex flex-col items-center w-full md:w-1/3 order-3 md:order-3 relative group">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold font-display shadow-lg border-4 border-white relative z-10 overflow-hidden">
                        {currentData[2].profilePicture ? (
                           <img src={currentData[2].profilePicture} alt="Avatar" className="object-cover w-full h-full" />
                        ) : (
                           currentData[2].avatar
                        )}
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center border-2 border-white text-orange-800 shadow-sm">3</div>
                      </div>
                      <div className="w-full h-20 md:h-24 bg-gradient-to-t from-orange-50 to-white border-x border-t border-orange-100 rounded-t-2xl mt-4 flex flex-col items-center justify-end pb-4 transition-all group-hover:from-orange-100">
                        <p className="font-bold text-slate-700 text-sm truncate w-full text-center px-2">{currentData[2].name}</p>
                        <p className="text-sm font-black text-orange-600 mt-1">{currentData[2].points} pts</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TOP 10 LIST */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> {activeTab === "users" ? "Top 10 Innovator" : "Top Departments"}
                </h3>
                
                <div className="space-y-3">
                  {currentData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50/50 hover:bg-white group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center font-bold text-gray-400 group-hover:text-primary transition-colors">
                          #{item.rank}
                        </div>
                        <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">
                          {item.profilePicture ? (
                             <img src={item.profilePicture} alt="Avatar" className="object-cover w-full h-full" />
                          ) : (
                             item.avatar
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="font-black text-blue-700">{item.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400 font-medium">Belum ada data poin saat ini.</div>
          )}
        </div>
      )}



    </div>
  );
}
