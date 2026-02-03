"use client";
import React, { useState, useEffect, use } from "react";
import { 
  HiOutlineSave, 
  HiOutlineChevronLeft, 
  HiOutlineCheckCircle, 
  HiOutlineTemplate, 
  HiOutlineColorSwatch,
  HiOutlinePrinter,
  HiOutlineInformationCircle,
  HiOutlineChevronDown,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePencil
} from "react-icons/hi";

import Link from "next/link";
import axios from "axios";
import { PaperHeader } from "../../components/headers"; 

export default function EditPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [paperData, setPaperData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // UI Controls State
  const [openSection, setOpenSection] = useState<string>("info");

  // --- STYLING STATES ---
  const [styles, setStyles] = useState({
    fontFamily: "font-sans",
    lineHeight: "1.5",
    headingSize: "18", 
    textSize: "14",    
    textColor: "#000000",
    watermark: "CONFIDENTIAL",
    showWatermark: true,
    showBubbleSheet: false,
    showNote: false, 
    noteText: "Note: Use black/blue ballpoint only. Lead pencil is not allowed.", 
    logoUrl: "https://media.licdn.com/dms/image/v2/D4D0BAQGA4E56lsNThw/company-logo_200_200/company-logo_200_200/0/1695224355465?e=2147483647&v=beta&t=XDgZWCwvNAcrgv3Tfg2T64YBDnjbsyEV_jkbD5g8UxI",
    layoutType: "default",
  });

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/papers?id=${id}`);
        if (res.data.length > 0) {
          const data = res.data[0];
          setPaperData(data);
          
          // Load saved styles if they exist
          if (data.style) {
            setStyles((prev) => ({ 
                ...prev, 
                ...data.style,
                logoUrl: data.style.logoUrl || prev.logoUrl
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:3001/papers/${paperData.id}`, {
        ...paperData,
        style: styles,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      alert("Save failed!");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-slate-600">Loading Editor...</div>
  );

  const layouts = [
    { id: 'default', name: 'Layout 01' },
    { id: 'academy-pro', name: 'Layout 02' },
    { id: 'modern-bar', name: 'Layout 03' },
    { id: 'grid-table', name: 'Layout 04' },
    { id: 'formal-double', name: 'Layout 05' },
    { id: 'marking-panel', name: 'Layout 06' },
    { id: 'minimalist-top', name: 'Layout 07' },
    { id: 'university-elegant', name: 'Layout 08' },
    { id: 'split-sidebar', name: 'Layout 09' },
    { id: 'classic-school', name: 'Layout 10' },
  ];

  return (
    <div className="relative flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <HiOutlineCheckCircle size={22} /> <span className="font-bold">Settings Saved!</span>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-xl z-20 print:hidden">
        <div className="p-5 border-b bg-slate-50">
          <Link href="/saved-papers" className="flex items-center gap-1 text-slate-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2 transition-all">
            <HiOutlineChevronLeft size={14} /> Back
          </Link>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <HiOutlineColorSwatch className="text-blue-600" /> Designer
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* 1. Paper Details Section (Date & Time) */}
          <div className="border-b">
            <button onClick={() => toggleSection("info")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                 <HiOutlineCalendar size={16} className="text-blue-600"/> Paper Info
               </div>
               <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "info" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "info" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Examination Date</label>
                  <input 
                    type="date" 
                    value={paperData?.paperDate || ""} 
                    onChange={(e) => setPaperData({...paperData, paperDate: e.target.value})}
                    className="w-full p-2 border rounded text-xs text-gray-600 outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Time Allowed</label>
                  <div className="flex items-center gap-2 bg-white border rounded px-2">
                    <HiOutlineClock className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. 2 Hours"
                      value={paperData?.paperTime || ""} 
                      onChange={(e) => setPaperData({...paperData, paperTime: e.target.value})}
                      className="w-full p-2 text-xs text-gray-600 outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Layouts Section */}
          <div className="border-b">
            <button onClick={() => toggleSection("layouts")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                 <HiOutlineTemplate size={16} className="text-blue-600"/> Layouts
               </div>
               <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "layouts" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "layouts" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                {layouts.map((layout) => (
                  <button 
                    key={layout.id}
                    onClick={() => setStyles({...styles, layoutType: layout.id})}
                    className={`py-2 px-3 text-[10px] font-bold uppercase border rounded-lg transition-all ${
                      styles.layoutType === layout.id 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {layout.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Formatting Section */}
          <div className="border-b">
            <button onClick={() => toggleSection("formatting")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                 <HiOutlinePencil size={16} className="text-blue-600"/>  Text Formatting
               </div>
               <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "formatting" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "formatting" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Font Style</label>
                    <div className="flex rounded-md shadow-sm">
                      <button onClick={()=>setStyles({...styles, fontFamily: "font-sans"})} className={`flex-1 py-1 text-[10px] text-gray-600 border rounded-md ${styles.fontFamily==='font-sans' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Sans</button>
                      <button onClick={()=>setStyles({...styles, fontFamily: "font-serif"})} className={`flex-1 py-1 text-[10px] text-gray-600 border rounded-md ${styles.fontFamily==='font-serif' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Serif</button>
                      <button onClick={()=>setStyles({...styles, fontFamily: "font-mono"})} className={`flex-1 py-1 text-[10px] text-gray-600 border rounded-md ${styles.fontFamily==='font-mono' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Mono</button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Ques Size</label>
                       <input type="number" value={styles.headingSize} onChange={(e)=>setStyles({...styles, headingSize: e.target.value})} className="w-full p-1.5 border rounded text-gray-600 text-xs outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Text Size</label>
                       <input type="number" value={styles.textSize} onChange={(e)=>setStyles({...styles, textSize: e.target.value})} className="w-full p-1.5 border rounded text-xs text-gray-600 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Line Height</label>
                       <input type="number" step="0.1" value={styles.lineHeight} onChange={(e)=>setStyles({...styles, lineHeight: e.target.value})} className="w-full p-1.5 border rounded text-gray-600 text-xs outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-slate-400 uppercase">Color</label>
                       <div className="flex items-center gap-2 border rounded p-1 bg-white">
                         <input type="color" value={styles.textColor} onChange={(e)=>setStyles({...styles, textColor: e.target.value})} className="w-6 h-6 border-none p-0 cursor-pointer rounded-full overflow-hidden" />
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* 4. Elements Section */}
          <div className="border-b">
            <button onClick={() => toggleSection("elements")} className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-700 tracking-wider">
                 <HiOutlineDocumentText size={16} className="text-blue-600"/> Page Elements
               </div>
               <HiOutlineChevronDown className={`text-slate-400 transition-transform duration-300 ${openSection === "elements" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "elements" && (
              <div className="px-5 pb-5 pt-1 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2">
                 <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border shadow-sm">
                    <span className="text-[10px] font-bold text-slate-700">Add Bubble Sheet</span>
                    <input type="checkbox" checked={styles.showBubbleSheet} onChange={(e)=>setStyles({...styles, showBubbleSheet: e.target.checked})} className="w-4 h-4 accent-blue-600" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <label className="text-[9px] font-bold text-slate-500 uppercase">Watermark</label>
                       <input type="checkbox" checked={styles.showWatermark} onChange={(e)=>setStyles({...styles, showWatermark: e.target.checked})} className="w-3 h-3  accent-blue-600" />
                    </div>
                    <input type="text" disabled={!styles.showWatermark} value={styles.watermark} onChange={(e)=>setStyles({...styles, watermark: e.target.value})} className="w-full p-2 border text-gray-500 rounded text-xs disabled:bg-slate-100" placeholder="e.g. Confidential" />
                 </div>
                 <div className="space-y-2 bg-white p-2 rounded border">
                    <div className="flex items-center justify-between">                        
                      <span className="text-[10px] font-bold text-gray-400">Exam Note</span>                        
                      <input type="checkbox" checked={styles.showNote} onChange={(e)=>setStyles({...styles, showNote: e.target.checked})} className="accent-blue-600" />
                    </div>
                    {styles.showNote && (
                        <textarea 
                           value={styles.noteText} 
                           onChange={(e)=>setStyles({...styles, noteText: e.target.value})}
                           className="w-full text-[10px] p-1 text-gray-400 border rounded h-12 focus:border-blue-500 outline-none"
                           placeholder="Type instructions..."
                       />
                    )}
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Logo URL</label>
                    <input type="text" value={styles.logoUrl} onChange={(e)=>setStyles({...styles, logoUrl: e.target.value})} className="w-full p-2 border rounded text-[10px] text-blue-600 underline" />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t space-y-2">
          <button onClick={() => window.print()} className="w-full py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
            <HiOutlinePrinter size={16} /> PRINT PAPER
          </button>
          <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
            <HiOutlineSave size={16} /> {isSaving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </div>
      </aside>

      {/* --- MAIN PAPER AREA --- */}
      <main className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar bg-slate-200 print:p-0 print:bg-white print:overflow-visible">
        <div 
          className={`bg-white w-[850px] min-h-[1100px] h-fit shadow-2xl relative p-12 transition-all duration-300 print:shadow-none print:w-full print:p-4 ${styles.fontFamily}`}
          style={{ color: styles.textColor, lineHeight: styles.lineHeight }}
        >
          {/* Watermark */}
          {styles.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
              <h1 style={{ transform: 'rotate(-45deg)', fontSize: '120px' }} className="font-black text-slate-400 opacity-[0.2] whitespace-nowrap uppercase select-none">
                {styles.watermark}
              </h1>
            </div>
          )}

          {paperData && (
            <div className="relative z-10">
              {/* Passing date and time specifically into the header info */}
              <PaperHeader 
                type={styles.layoutType} 
                info={{
                  ...paperData.info, 
                  paperDate: paperData.paperDate, 
                  paperTime: paperData.paperTime 
                }} 
                styles={styles} 
                onChangeLogo={()=>{}} 
              />

                {/* --- BUBBLE SHEET --- */}
                {styles.showBubbleSheet && paperData.MCQs?.length > 0 && (
                  <div className="break-inside-avoid border border-slate-300 p-2 rounded-xl bg-slate-50/50 print:bg-transparent print:border-black mt-4">
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


              {/* Editable Content Area */}
              <div 
                contentEditable={true}
                suppressContentEditableWarning={true} 
                style={{ fontSize: styles.textSize + "px" }} 
                className="mt-6 outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-4 rounded-sm p-2 transition-all"
              >

                {styles.showNote && (
                <div className="rounded-lg flex items-start gap-3 mb-3 print:bg-transparent">
                    <HiOutlineInformationCircle className="text-slate-600 mt-0.5 shrink-0 print:hidden" size={18} />
                    <p className="text-[11px] font-bold italic text-slate-700 leading-relaxed">
                        {styles.noteText}
                    </p>
                </div>
              )}
                
                {/* --- Section A: MCQs --- */}
                {paperData.MCQs?.length > 0 && (
                  <div className="mb-8 mt-4">
                    <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic text-sm">Section-A: Multiple Choice Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.MCQs.length}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {paperData.MCQs.map((q: any, i: number) => (
                        <div key={i} className="break-inside-avoid">
                          <div className="flex gap-2">
                             <span className="font-bold shrink-0">{i+1}.</span>
                             <p className="font-bold" style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 ml-6">
                            {q.options && Object.entries(q.options).map(([k, v]: any) => (
                              <div key={k} className="flex items-center gap-2">
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

                {/* --- Section B: Short Questions --- */}
                {paperData.Short?.length > 0 && (
                    <div className="mt-8">
                      <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic text-sm">Section-B: Short Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.Short.length * 2}</span>
                      </div>
                      <div className="space-y-6">
                         {paperData.Short.map((q: any, i: number) => (
                            <div key={i} className="break-inside-avoid">
                               <p className="font-bold flex gap-2">
                                  <span className="shrink-0">Q{i+1}.</span>
                                  <span style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</span>
                               </p>
                            </div>
                         ))}
                      </div>
                    </div>
                )}

                {/* --- Section C: Long Questions --- */}
                {paperData.Long?.length > 0 && (
                    <div className="mt-10">
                      <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-6">
                        <h3 className="font-bold uppercase italic text-sm">Section-C: Detailed Questions</h3>
                        <span className="font-bold text-xs">Marks: {paperData.Long.length * 5}</span>
                      </div>
                      <div className="space-y-8">
                         {paperData.Long.map((q: any, i: number) => (
                            <div key={i} className="break-inside-avoid">
                               <p className="font-bold flex gap-2 mb-2">
                                  <span className="shrink-0">Q{i+1}.</span>
                                  <span style={{ fontSize: styles.headingSize + "px" }}>{q.question || q.text}</span>
                               </p>
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
        </div>
      </main>
    </div>
  );
}