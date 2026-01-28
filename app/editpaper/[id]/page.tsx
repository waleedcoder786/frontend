"use client";
import React, { useState, useEffect, use } from "react";
import { HiOutlineSave, HiOutlineChevronLeft, HiOutlineCheckCircle } from "react-icons/hi";
import Link from "next/link";
import axios from "axios";

export default function EditPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [paperData, setPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- STYLING STATES ---
  const [styles, setStyles] = useState({
    fontFamily: "font-serif",
    lineHeight: "1.6",
    headingSize: "30px",
    textSize: "14px",
    textColor: "#000",
    watermark: "CONFIDENTIAL",
    showWatermark: true
  });

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/papers?id=${id}`);
        if (res.data.length > 0) {
          const data = res.data[0];
          setPaperData(data);
          if (data.style) setStyles({ ...styles, ...data.style });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (id) fetchPaper();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:3001/papers/${paperData.id}`, {
        ...paperData,
        style: styles
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) { alert("Save failed!"); }
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Editor...</div>;

  return (
    <div className="relative flex h-screen w-screen bg-slate-200 overflow-hidden">
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-in fade-in zoom-in">
          <HiOutlineCheckCircle size={20} /> Settings Saved!
        </div>
      )}

      {/* --- SIDEBAR CONTROLS --- */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-4 overflow-y-auto print:hidden shadow-xl">
        <Link href="/saved-papers" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-2">
          <HiOutlineChevronLeft /> Back
        </Link>
        <h2 className="text-xl font-bold border-b pb-2 text-black ">Style Editor</h2>

        {/* Font Family */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Font Style</label>
          <select 
            value={styles.fontFamily} 
            onChange={(e) => setStyles({...styles, fontFamily: e.target.value})}
            className="w-full p-2 border rounded-md text-slate-600 uppercase text-sm bg-slate-50"
          >
            <option value="font-serif">Serif (Formal)</option>
            <option value="font-sans">Sans (Modern)</option>
            <option value="font-mono">Monospace</option>
          </select>
        </div>

        {/* Font Sizes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Heading Size</label>
            <input type="number"  value={styles.headingSize.replace("px","")} onChange={(e)=>setStyles({...styles, headingSize: e.target.value+"px"})} className="w-full p-2 border text-slate-600 uppercase rounded text-sm"/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Text Size</label>
            <input type="number" value={styles.textSize.replace("px","")} onChange={(e)=>setStyles({...styles, textSize: e.target.value+"px"})} className="w-full p-2 border text-slate-600 uppercase rounded text-sm"/>
          </div>
        </div>

        {/* Colors & Spacing */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Text Color</label>
          <input type="color" value={styles.textColor} onChange={(e)=>setStyles({...styles, textColor: e.target.value})} className="w-full h-10 p-1 border rounded cursor-pointer"/>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height ({styles.lineHeight})</label>
          <input type="range" min="1" max="3" step="0.1" value={styles.lineHeight} onChange={(e)=>setStyles({...styles, lineHeight: e.target.value})} className="w-full accent-blue-600"/>
        </div>

        {/* Watermark */}
        <div className="space-y-1 border-t pt-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Watermark Text</label>
          <input type="text" value={styles.watermark} onChange={(e)=>setStyles({...styles, watermark: e.target.value})} className="w-full p-2 border rounded text-slate-600  text-sm placeholder:italic" placeholder="Paper"/>
          <div className="flex items-center gap-2 mt-2">
            <input   type="checkbox" checked={styles.showWatermark} onChange={(e)=>setStyles({...styles, showWatermark: e.target.checked})} id="wm" />
            <label htmlFor="wm" className="text-sm text-gray-700">Show Watermark</label>
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="mt-4 w-full py-3 bg-slate-900 hover:bg-black  text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-300">
          <HiOutlineSave size={20} /> {isSaving ? "Saving..." : "Apply Changes"}
        </button>
      </aside>

      {/* --- PAPER CANVAS --- */}
      <main className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar print:p-0">
        <div 
          className={`bg-white w-[850px] min-h-[1100px] shadow-2xl relative p-16 overflow-hidden print:shadow-none ${styles.fontFamily}`}
          style={{ color: styles.textColor, lineHeight: styles.lineHeight }}
        >
          {/* Watermark Layer */}
          {styles.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center  ">
              <h1 style={{ transform: 'rotate(-45deg)', fontSize: '60px' }} className="  font-black    p-10  text-gray-400 ">
                {styles.watermark}
              </h1>
            </div>
          )}

          {paperData && (
            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-4 border-black pb-4 text-center mb-10">
                <h1 style={{ fontSize: styles.headingSize }} className="font-black uppercase">Standardized Examination</h1>
                <div className="flex justify-between mt-8 text-[15px] font-bold">
                  <span>Class: {paperData.info?.class}</span>
                  <span className="underline decoration-double">Subject: {paperData.info?.subject}</span>
                  <span>Marks: {paperData.info?.totalMarks}</span>
                </div>
              </div>

              {/* Sections (MCQs, Short, Long) */}
              <div style={{ fontSize: styles.textSize }}>
                {/* MCQs */}
                {paperData.MCQs?.length > 0 && (
                   <div className="mb-8">
                     <div className="flex justify-between border-b-2 border-black mb-4 font-black italic">
                       <span>Section-A (MCQs)</span>
                       <span>Marks: {paperData.MCQs.length}</span>
                     </div>
                     {paperData.MCQs.map((q: any, i: number) => (
                       <div key={i} className="mb-4">
                         <p className="font-bold">{i+1}. {q.question || q.text}</p>
                         <div className="flex gap-6 ml-6 mt-1 opacity-90">
                           {q.options && Object.entries(q.options).map(([k,v]: any) => (
                             <span key={k}>({k}) {v}</span>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}