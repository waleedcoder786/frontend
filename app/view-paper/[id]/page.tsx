"use client";
import React, { useState, useEffect, use } from "react";
import { HiOutlineChevronLeft, HiOutlineInformationCircle } from "react-icons/hi";
import Link from "next/link";
import axios from "axios";
// 1. PaperHeader کو امپورٹ کریں
import { PaperHeader } from "../../components/headers"; 

export default function ViewPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [paperData, setPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Default styles wese hi rakhein jese Edit page me thay
  const [styles, setStyles] = useState({
    fontFamily: "font-sans",
    lineHeight: "1.5",
    headingSize: "18", // Default numeric string
    textSize: "14",
    textColor: "#000000",
    watermark: "CONFIDENTIAL",
    showWatermark: true,
    showNote: false,
    noteText: "",
    layoutType: "default", // Default layout
    logoUrl: "", // Logo URL state
    showBubbleSheet: false // Added specifically for view
  });

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/papers?id=${id}`);
        if (res.data.length > 0) {
          const data = res.data[0];
          setPaperData(data);
          
          // Agar database me style saved hai to usay apply karein
          if (data.style) {
            setStyles((prev) => ({ 
                ...prev, 
                ...data.style,
                // Ensure layoutType is correctly set from saved data
                layoutType: data.style.layoutType || "default"
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching paper:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPaper();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Paper...</div>;

  return (
    <div className={`relative flex h-screen w-screen bg-slate-200 overflow-hidden ${styles.fontFamily}`}>
      <Link href="/saved-papers">
        <button className="absolute z-50 flex items-center gap-2 mt-5 ml-8 text-slate-700 hover:text-blue-600 font-bold text-sm print:hidden">
          <HiOutlineChevronLeft /> Back
        </button>
      </Link>

      <main className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar print:p-0 print:overflow-visible">
        <div 
          className="bg-white w-[850px] h-fit min-h-[1100px] shadow-2xl relative p-16 mb-20 print:mb-0 print:p-10 print:shadow-none print:w-full"
          style={{ 
            color: styles.textColor, 
            lineHeight: styles.lineHeight,
          }}
        >
          {/* --- WATERMARK --- */}
          {styles.showWatermark && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
               <h1 style={{ transform: 'rotate(-45deg)', fontSize: '120px' }} className="font-black text-slate-400 opacity-[0.6] whitespace-nowrap uppercase select-none">
                 {styles.watermark}
               </h1>
             </div>
          )}

          {paperData && (
            <div className="relative z-10 h-auto">
              
              {/* 2. یہاں PaperHeader کمپوننٹ استعمال کیا ہے */}
              <PaperHeader 
                type={styles.layoutType} 
                info={paperData.info} 
                styles={styles} 
                onChangeLogo={() => {}} // View mode me logo change nahi hoga
              />

                {/* --- BUBBLE SHEET (View Mode) --- */}
                {styles.showBubbleSheet && paperData.MCQs?.length > 0 && (
                  <div className="break-inside-avoid border border-slate-300 p-2 rounded-xl bg-slate-50/50 print:bg-transparent print:border-black mb-6 mt-4">
                      <div className="grid grid-cols-4 gap-4">
                        {paperData.MCQs.map((_:any, i:number) => (
                           <div key={i} className="flex items-center gap-2 justify-center">
                              <span className="text-[10px] font-bold w-4 text-right">{i+1}.</span>
                              <div className="flex gap-1">
                                {['A','B','C','D'].map((opt) => (
                                   <div key={opt} className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px]">{opt}</div>
                                ))}
                              </div>
                           </div>
                        ))}
                      </div>
                  </div>
                )}

              {/* --- SAVED NOTE SECTION --- */}
              {styles.showNote && styles.noteText && (
                 <div className="rounded-lg flex items-start gap-3 mb-6 print:bg-transparent mt-4">
                    <HiOutlineInformationCircle className="text-slate-600 mt-0.5 shrink-0 print:hidden" size={18} />
                    <p className="text-[11px] font-bold italic text-slate-700 leading-relaxed">
                        {styles.noteText}
                    </p>
                </div>
              )}

              <div style={{ fontSize: styles.textSize + "px" }}>
                
                {/* Section A (MCQs) */}
                {paperData.MCQs?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic text-sm">Section-A: Multiple Choice Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.MCQs.length}</span>
                    </div>
                    <div className="space-y-4">
                      {paperData.MCQs.map((q: any, i: number) => (
                        <div key={i} className="break-inside-avoid">
                          <div className="flex gap-2">
                             <span className="font-bold shrink-0">{i + 1}.</span>
                             {/* Applying Heading Size logic here too */}
                             <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-6 mt-2">
                            {q.options && Object.entries(q.options).map(([k, v]: any) => (
                              <div key={k} className="flex items-center gap-1">
                                  <span className="w-5 h-5 border border-black rounded-full text-[10px] flex items-center justify-center font-bold uppercase shrink-0">{k}</span>
                                  <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B (Short) */}
                {paperData.Short?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic font text-sm">Section-B: Short Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.Short.length * 2}</span>
                    </div>
                    <div className="space-y-6">
                      {paperData.Short.map((q: any, i: number) => (
                        <div key={i} className="flex gap-2 break-inside-avoid">
                          <span className="font-bold shrink-0">Q.{i + 1}</span>
                          <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section C (Long) */}
                {paperData.Long?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic text-sm">Section-C: Detailed Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.Long.length * 5}</span>
                    </div>
                    <div className="space-y-6">
                      {paperData.Long.map((q: any, i: number) => (
                        <div key={i} className="flex gap-2 break-inside-avoid">
                          <span className="font-bold shrink-0">Q.{i + 1}</span>
                          <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="mt-12 pt-4 border-t border-slate-900 flex justify-between text-[9px] uppercase font-bold tracking-widest text-slate-500">
                  <span>Generated by Exam System</span>
                  <span>Property of {paperData.info?.schoolName || 'Institute'}</span>
              </div>
            </div>
          )}
        </div>.,x.
      </main>

      <style jsx global>{`
        @media print {
          .custom-scrollbar { overflow: visible !important; }
          body { background: white !important; }
          .print\:p-0 { padding: 0 !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}