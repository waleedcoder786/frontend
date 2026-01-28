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

  const [styles, setStyles] = useState({
    fontFamily: "font-serif",
    lineHeight: "1",
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

  

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Editor...</div>;

  return (
    <div className="relative flex h-screen w-screen bg-slate-200 overflow-hidden">
        <Link href="/saved-papers" >
        <button className=" absolute   flex items-center gap-2 mt-5  text-slate-700 hover:text-blue-600 text-sm " >
          <HiOutlineChevronLeft /> Back
        </button>
        </Link>
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