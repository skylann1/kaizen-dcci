"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, FileText, ChevronRight, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState({
    original: 0,
    hoshinKanri: 0,
    yokoten: 0,
    sqcdmpe: {
      safety: 0,
      quality: 0,
      cost: 0,
      delivery: 0,
      morale: 0,
      productivity: 0,
      environment: 0,
      peopleDevelopment: 0,
    },
    costImpact: 0,
  });

  const handleOpenAssessment = (item: any) => {
    setSelectedSuggestion(item);
    setAssessmentData({
      original: 0,
      hoshinKanri: 0,
      yokoten: 0,
      sqcdmpe: {
        safety: 0,
        quality: 0,
        cost: 0,
        delivery: 0,
        morale: 0,
        productivity: 0,
        environment: 0,
        peopleDevelopment: 0,
      },
      costImpact: 0,
    });
    setShowGuidance(false);
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
    
    const { original, hoshinKanri, yokoten, sqcdmpe, costImpact } = assessmentData;
    const totalKolom1 = original + hoshinKanri + yokoten;
    const totalSQCDMPE = Object.values(sqcdmpe).reduce((a, b) => a + b, 0);

    if (original > 25) {
      alert("Nilai Original maksimal 25.");
      return;
    }
    if (hoshinKanri > 20) {
      alert("Nilai Hoshin Kanri maksimal 20.");
      return;
    }
    if (yokoten > 15) {
      alert("Nilai Yokoten maksimal 15.");
      return;
    }
    if (totalKolom1 > 60) {
      alert("Total Kolom Penilaian #1 tidak boleh melebihi 60 poin.");
      return;
    }
    if (totalSQCDMPE > 40) {
      alert("Total Dampak Improvement (SQCDMPE+P) tidak boleh melebihi 40 poin.");
      return;
    }

    handleUpdateStatus(selectedSuggestion, "Approved", {
      assessment: {
        original,
        hoshinKanri,
        yokoten,
        sqcdmpe
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

  const totalKolom1 = assessmentData.original + assessmentData.hoshinKanri + assessmentData.yokoten;
  const totalSQCDMPE = Object.values(assessmentData.sqcdmpe).reduce((a, b) => a + b, 0);
  const totalKeseluruhan = totalKolom1 + totalSQCDMPE;

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
              
              {/* GUIDANCE TOGGLE */}
              <div className="mb-6 bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setShowGuidance(!showGuidance)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <Info className="w-5 h-5 text-blue-600" />
                    Panduan & Matrix Penilaian
                  </div>
                  {showGuidance ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
                </button>
                
                {showGuidance && (
                  <div className="p-4 pt-0 text-sm text-slate-700 space-y-4 border-t border-blue-100/50 mt-2">
                    <div>
                      <h5 className="font-bold mb-1">A. Kriteria Penilaian (Maks 60 Poin)</h5>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li><strong>Original (Maks 25):</strong> Ide murni, baru, dan tingkat kreativitas tinggi.</li>
                        <li><strong>Hoshin Kanri (Maks 20):</strong> Keselarasan ide dengan target/KPI perusahaan atau departemen.</li>
                        <li><strong>Yokoten (Maks 15):</strong> Potensi atau hasil dari penyebaran/penerapan ide di area atau mesin lain.</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold mb-1">B. Dampak SQCDMPE+P (Skala 1-5)</h5>
                      <p className="text-gray-600 mb-2">Pilih tingkat dampak improvement untuk setiap kategori berdasarkan skala berikut:</p>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium">
                        <div className="bg-white p-2 rounded border border-gray-200">1: Sangat Rendah</div>
                        <div className="bg-white p-2 rounded border border-gray-200">2: Rendah</div>
                        <div className="bg-white p-2 rounded border border-gray-200">3: Sedang</div>
                        <div className="bg-white p-2 rounded border border-gray-200">4: Tinggi</div>
                        <div className="bg-white p-2 rounded border border-gray-200">5: Sangat Tinggi</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form id="assessmentForm" onSubmit={handleSubmitAssessment} className="space-y-8">
                
                {/* Kolom #1: Kriteria Penilaian (60 poin) */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-end">
                    <span>A. Kriteria Penilaian</span>
                    <span className="text-xs font-medium text-gray-500 font-sans">Total Maksimal 60 Poin</span>
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'original', label: '1. Original', desc: 'Keaslian ide dan kreativitas improvement', max: 25 },
                      { key: 'hoshinKanri', label: '2. Hoshin Kanri', desc: 'Tingkat keselarasan dengan target perusahaan', max: 20 },
                      { key: 'yokoten', label: '3. Yokoten', desc: 'Hasil pengembangan atau penyebaran horizontal dari kaizen', max: 15 }
                    ].map(item => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-700">{item.label}</label>
                          <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" min="0" max={item.max} required
                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800"
                            value={(assessmentData as any)[item.key]}
                            onChange={(e) => setAssessmentData({...assessmentData, [item.key]: parseInt(e.target.value) || 0})}
                          />
                          <span className="text-xs font-bold text-gray-400 uppercase">/ {item.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-indigo-800">Subtotal Kriteria:</span>
                    <span className={`text-lg font-bold font-display ${totalKolom1 > 60 ? 'text-red-500' : 'text-indigo-600'}`}>
                      {totalKolom1} <span className="text-sm font-sans text-indigo-400">/ 60</span>
                    </span>
                  </div>
                </div>

                {/* Kolom #2: Dampak Improvement SQCDMPE+P (40 poin) */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-end">
                    <span>B. Dampak Improvement (SQCDMPE + P)</span>
                    <span className="text-xs font-medium text-gray-500 font-sans">Total Maksimal 40 Poin — Skala 1–5</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: 'safety', label: 'Safety (S)' },
                      { key: 'quality', label: 'Quality (Q)' },
                      { key: 'cost', label: 'Cost (C)' },
                      { key: 'delivery', label: 'Delivery (D)' },
                      { key: 'morale', label: 'Morale (M)' },
                      { key: 'productivity', label: 'Productivity (P)' },
                      { key: 'environment', label: 'Environment (E)' },
                      { key: 'peopleDevelopment', label: 'People Dev. (P)' }
                    ].map(item => (
                      <div key={item.key} className="flex flex-col p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <label className="text-xs font-bold text-slate-700 mb-2">{item.label}</label>
                        <select
                          required
                          className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 bg-white"
                          value={(assessmentData.sqcdmpe as any)[item.key]}
                          onChange={(e) => setAssessmentData({
                            ...assessmentData, 
                            sqcdmpe: { ...assessmentData.sqcdmpe, [item.key]: parseInt(e.target.value) || 0 }
                          })}
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-800">Subtotal SQCDMPE+P:</span>
                    <span className={`text-lg font-bold font-display ${totalSQCDMPE > 40 ? 'text-red-500' : 'text-primary'}`}>
                      {totalSQCDMPE} <span className="text-sm font-sans text-blue-400">/ 40</span>
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
                  {totalKeseluruhan}
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
                  disabled={processingId === selectedSuggestion._id || totalSQCDMPE > 40 || totalKolom1 > 60}
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
