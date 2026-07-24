"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, FileText, ChevronRight } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState({
    levelProposal: 0,
    keaslianTema: 0,
    pengembanganIde: 0,
    sqcdme: {
      safety: 0,
      quality: 0,
      cost: 0,
      delivery: 0,
      moral: 0,
      environment: 0,
    },
    costImpact: 0,
  });

  const handleOpenAssessment = (item: any) => {
    setSelectedSuggestion(item);
    setAssessmentData({
      levelProposal: 0,
      keaslianTema: 0,
      pengembanganIde: 0,
      sqcdme: {
        safety: 0,
        quality: 0,
        cost: 0,
        delivery: 0,
        moral: 0,
        environment: 0,
      },
      costImpact: 0,
    });
    setAssessmentModalOpen(true);
  };

  const handleUpdateStatus = async (item: any, status: string, customData?: any) => {
    let payload: any = { status };
    if (status === "Approved" && customData) {
      payload.assessment = customData.assessment;
      payload.costImpact = customData.costImpact;
    }

    try {
      setProcessingId(item._id);
      const res = await fetch(`/api/suggestions/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setApprovals(prev => prev.filter(s => s._id !== item._id));
        setAssessmentModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update suggestion");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion) return;
    
    const { levelProposal, keaslianTema, pengembanganIde, sqcdme, costImpact } = assessmentData;
    const totalSQCDME = Object.values(sqcdme).reduce((a, b) => a + b, 0);

    if (levelProposal > 20 || keaslianTema > 20 || pengembanganIde > 20) {
      alert("Nilai maksimal untuk setiap kriteria Kolom 1 adalah 20.");
      return;
    }
    
    if (totalSQCDME > 40) {
      alert("Total nilai SQCDME tidak boleh melebihi 40 poin.");
      return;
    }

    handleUpdateStatus(selectedSuggestion, "Approved", {
      assessment: {
        levelProposal,
        keaslianTema,
        pengembanganIde,
        sqcdme
      },
      costImpact
    });
  };

  useEffect(() => {
    fetch("/api/suggestions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApprovals(data.filter((s: any) => s.status === "Pending"));
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Pending Approvals</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve suggestions submitted by your department.</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by ID or Proposer Name..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-primary w-full md:w-auto">
            <option>All Categories</option>
            <option>Safety</option>
            <option>Quality</option>
            <option>Cost Down</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Suggestion Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Idea Snippet</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">Loading approvals...</td>
                </tr>
              ) : approvals.length > 0 ? (
                approvals.map((item) => {
                  let categoryBadge = "bg-gray-100 text-gray-800";
                  if (item.category === "Safety / 5S / Lingkungan") categoryBadge = "bg-purple-100 text-purple-800";
                  if (item.category === "Quality / Product Improvement") categoryBadge = "bg-blue-100 text-blue-800";
                  if (item.category === "Cost Down / Efisiensi Biaya Operasional") categoryBadge = "bg-emerald-100 text-emerald-800";
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{item._id.substring(item._id.length - 8).toUpperCase()}</div>
                        <div className="text-sm font-medium text-primary mt-1">{item.author?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${categoryBadge}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                        <p className="text-sm text-gray-800 font-bold truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{item.problem}</p>
                        {item.costEffective?.nominal > 0 && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                            Hemat: Rp {item.costEffective.nominal.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenAssessment(item)}
                            disabled={processingId === item._id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-bold transition-colors ${processingId === item._id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item, "Rejected")}
                            disabled={processingId === item._id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-colors ${processingId === item._id ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button 
                            onClick={() => window.location.href = `/dashboard/suggestions/${item._id}`}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors ml-2 bg-gray-50 rounded-md border border-gray-100" 
                            title="View Full Details"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 font-display">All Caught Up!</h3>
                      <p className="text-sm text-gray-500 mt-2 max-w-sm">You have no pending suggestions waiting for your approval at this time.</p>
                    </div> 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RUBRIC ASSESSMENT MODAL */}
      {assessmentModalOpen && selectedSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-display text-slate-800">Kolom Penilaian (Rubrik Approval)</h3>
                <button onClick={() => setAssessmentModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Ide: <span className="font-bold text-primary">{selectedSuggestion.title}</span></p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <form id="assessmentForm" onSubmit={handleSubmitAssessment} className="space-y-8">
                
                {/* Kolom #1 */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-end">
                    <span>Kolom Penilaian #1</span>
                    <span className="text-xs font-medium text-gray-500 font-sans">Total 60 (Masing-masing maks 20)</span>
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'levelProposal', label: '1. Level Proposal', desc: 'Tingkat kemandirian dalam membuat tema' },
                      { key: 'keaslianTema', label: '2. Keaslian Tema', desc: 'Keaslian ide dan kreatifitas improvement' },
                      { key: 'pengembanganIde', label: '3. Pengembangan Ide', desc: 'Penyebaran horizontal dari ide' }
                    ].map(item => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-700">{item.label}</label>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" min="0" max="20" required
                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800"
                            value={(assessmentData as any)[item.key]}
                            onChange={(e) => setAssessmentData({...assessmentData, [item.key]: parseInt(e.target.value) || 0})}
                          />
                          <span className="text-xs font-bold text-gray-400 uppercase">/ 20</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom #2 */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-end">
                    <span>Kolom Penilaian #2 (SQCDME)</span>
                    <span className="text-xs font-medium text-gray-500 font-sans">Total Gabungan Maksimal 40</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'safety', label: 'Safety (S)' },
                      { key: 'quality', label: 'Quality (Q)' },
                      { key: 'cost', label: 'Cost (C)' },
                      { key: 'delivery', label: 'Delivery (D)' },
                      { key: 'moral', label: 'Moral (M)' },
                      { key: 'environment', label: 'Environment (E)' }
                    ].map(item => (
                      <div key={item.key} className="flex flex-col p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <label className="text-xs font-bold text-slate-700 mb-2">{item.label}</label>
                        <input 
                          type="number" min="0" max="40" required
                          className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800"
                          value={(assessmentData.sqcdme as any)[item.key]}
                          onChange={(e) => setAssessmentData({
                            ...assessmentData, 
                            sqcdme: { ...assessmentData.sqcdme, [item.key]: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-800">Total SQCDME:</span>
                    <span className={`text-lg font-bold font-display ${Object.values(assessmentData.sqcdme).reduce((a,b)=>a+b,0) > 40 ? 'text-red-500' : 'text-primary'}`}>
                      {Object.values(assessmentData.sqcdme).reduce((a,b)=>a+b,0)} <span className="text-sm font-sans text-blue-400">/ 40</span>
                    </span>
                  </div>
                </div>

                {/* Cost Impact */}
                {selectedSuggestion.category === "Cost Down / Efisiensi Biaya Operasional" && (
                  <div>
                    <h4 className="font-bold text-emerald-800 mb-2">Estimasi Penghematan (Rp)</h4>
                    <input 
                      type="number" min="0" required
                      className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800 bg-emerald-50/30"
                      placeholder="Contoh: 1500000"
                      value={assessmentData.costImpact || ''}
                      onChange={(e) => setAssessmentData({...assessmentData, costImpact: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-gray-500 mt-2">Karena ini kategori Cost Down, mohon masukkan nominal penghematan jika ada.</p>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="text-slate-800 font-bold">
                Total Poin Keseluruhan: <span className="text-2xl text-primary font-display ml-2">
                  {assessmentData.levelProposal + assessmentData.keaslianTema + assessmentData.pengembanganIde + Object.values(assessmentData.sqcdme).reduce((a,b)=>a+b,0)}
                </span>
                <span className="text-sm text-gray-400 font-sans ml-1">/ 100</span>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setAssessmentModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" form="assessmentForm"
                  disabled={processingId === selectedSuggestion._id || Object.values(assessmentData.sqcdme).reduce((a,b)=>a+b,0) > 40}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Ide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
