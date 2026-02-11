'use client';
import React, { useEffect, useState } from 'react';
import { FaGraduationCap, FaArrowLeft, FaChevronRight, FaCheckCircle, FaUserShield } from "react-icons/fa";
import Navbar from '../components/navbar/page';
import PaperPreview from '../paper/page'; 
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function GeneratePaper() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING & LOGIC ---
// Frontend: GeneratePaper.tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/classes'); 
      
      let rawData = res.data;
      let allDataFromDB = [];

      // Structure Normalization
      if (Array.isArray(rawData)) {
        allDataFromDB = rawData[0]?.classes || rawData;
      } else if (rawData.classes) {
        allDataFromDB = rawData.classes;
      }

      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(loggedInUser);

      // --- ONLY ROLE-BASED CHECK ---
      const isAdmin = loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin';
      
      let finalClasses = [];

      if (isAdmin) {
        // Admin ko database ka sara data milega, chahe uski apni 'classes' array khali ho
        finalClasses = allDataFromDB;
      } else {
        // Teacher ya kisi aur role ke liye filtered data
        finalClasses = allDataFromDB.filter((c: any) => 
          loggedInUser.classes?.includes(c.title)
        )
        .map((c: any) => ({
          ...c,
          subjects: (c.subjects || []).filter((s: any) => 
            loggedInUser.subjects?.includes(s.name)
          )
        }))
        .filter((c: any) => c.subjects && c.subjects.length > 0);
      }

      setClasses(finalClasses);
      
      const dataMap: any = {};
      finalClasses.forEach((c: any) => { 
        const key = c.id || c.title; 
        dataMap[key] = c; 
      });
      setFullData(dataMap);

    } catch (error) { 
      toast.error("Database Connection Failed");
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
  // --- REST OF THE CODE REMAINS SAME ---

  const currentSubjects = (selectedClassId && fullData && fullData[selectedClassId]) 
    ? (fullData[selectedClassId].subjects || []) : [];

  const handleBack = () => {
    if (selectedSubject) { 
        setSelectedSubject(null); 
        setSelectedChapters([]); 
    } else if (selectedClassId) { 
        setSelectedClassId(null); 
        setSelectedClassName(null); 
    }
  };

  const toggleChapter = (chapterName: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapterName) ? prev.filter(c => c !== chapterName) : [...prev, chapterName]
    );
  };

  if (showPreview) {
    return (
      <PaperPreview 
        className={selectedClassName || ''}
        subject={selectedSubject}
        chapters={selectedChapters}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  const isAdminUser = user?.role === 'superadmin' || user?.email === 'admin@example.com';

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <Toaster position="top-center"/>
      <Navbar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-10">
          <div className="flex items-center gap-4">
            {(selectedClassId || selectedSubject) && (
              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {selectedSubject ? `${selectedSubject.name}` : selectedClassName ? `${selectedClassName} Subjects` : 'Generate Test Paper'}
              </h1>
              {isAdminUser && (
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
                  <FaUserShield /> Full Admin Access
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Step {selectedSubject ? "3" : selectedClassId ? "2" : "1"} of 3
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          
          {loading ? (
             <div className="h-full flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-widest">
                Loading System Data...
             </div>
          ) : (
            <>
              {/* STEP 1 */}
              {!selectedClassId && (
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                  <h2 className="text-3xl font-black text-slate-900 mb-10">
                    {isAdminUser ? 'All Classes (Master View)' : 'Your Assigned Classes'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {classes.length > 0 ? classes.map((item: any) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedClassId(item.id); setSelectedClassName(item.title); }} 
                        className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-72"
                      >
                        <img src={item.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-20 group-hover:opacity-40" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent group-hover:opacity-0 transition-opacity duration-500" />
                        <div className="relative p-8 h-full flex flex-col justify-between z-10">
                          <div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                              <FaGraduationCap size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{item.title}</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                            View Subjects <FaChevronRight size={10} />
                          </div>
                        </div>
                      </div>
                    )) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed text-slate-400 font-bold">
                            No classes available.
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {selectedClassId && !selectedSubject && (
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-right-10 duration-500">
                  {currentSubjects.map((sub: any, i: number) => (
                    <div key={i} onClick={() => setSelectedSubject(sub)} className="group bg-white p-4 rounded-xl border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                      <div className="relative h-28 rounded-xl overflow-hidden mb-4 bg-slate-100">
                        <img src={sub.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 px-2">{sub.name}</h3>
                    </div>
                  ))}
                  {currentSubjects.length === 0 && (
                      <div className="col-span-full text-center py-20 text-slate-400 font-bold italic">
                          No subjects found for this class.
                      </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {selectedSubject && (
                <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Select Chapters</h2>
                      <p className="text-slate-500 font-bold mt-2">Selected: {selectedChapters.length}</p>
                    </div>
                    <button 
                      onClick={() => setShowPreview(true)}
                      disabled={selectedChapters.length === 0}
                      className={`px-10 py-5 rounded-md font-black shadow-xl transition-all ${selectedChapters.length > 0 ? 'bg-blue-600 text-white hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      Generate Paper 
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubject.chapters.map((chapter: any, idx: number) => {
                      const chapterName = typeof chapter === 'string' ? chapter : chapter.name;
                      const isSelected = selectedChapters.includes(chapterName);
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => toggleChapter(chapterName)} 
                          className={`p-6 rounded-md border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? 'border-blue-600 bg-blue-50/50' : 'bg-white border-slate-100 hover:border-blue-200'
                          }`}
                        >
                          <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                            {idx + 1}. {chapterName}
                          </span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-200'
                          }`}>
                            {isSelected && <FaCheckCircle className="text-white text-[10px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}