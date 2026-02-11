"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { 
  FileText, Plus, Database, UploadCloud, 
  Loader2, MousePointer2, FileSpreadsheet, ChevronRight,
  Layers, Tag, Info, BookOpen, AlertCircle, DatabaseZap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const WhiteAdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [type, setType] = useState("mcq"); 
  const [inputMode, setInputMode] = useState<"manual" | "excel">("manual");

  const [allClassesData, setAllClassesData] = useState<any[]>([]);
  const [isNewTopic, setIsNewTopic] = useState(false);

  const [formData, setFormData] = useState({
    classId: "", 
    subjectName: "",
    chapterName: "",
    category: "Exercise Questions",
    topic: "",
    question: "",
    options: { A: "", B: "", C: "", D: "" },
    answer: "", 
  });

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser && (storedUser.role === "superadmin" || storedUser.email === "admin@example.com")) {
      setUser(storedUser);
      fetchDB();
    }
  }, []);

  const fetchDB = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      setAllClassesData(res.data || []);
    } catch (err) {
      toast.error("Cloud Database Offline", { icon: '☁️' });
    }
  };

  // --- DATA HIERARCHY LOGIC ---
  const classesList = allClassesData[0]?.classes || [];
  const selectedClassObj = classesList.find((c: any) => c.id === formData.classId);
  const availableSubjects = selectedClassObj?.subjects || [];
  const selectedSubjectObj = availableSubjects.find((s: any) => s.name === formData.subjectName);
  const availableChapters = (selectedSubjectObj?.chapters || []).map((ch: any) => typeof ch === 'string' ? { name: ch } : ch);
  const selectedChapterObj = availableChapters.find((ch: any) => ch.name === formData.chapterName);
  const availableTopics = selectedChapterObj?.topics || [];

  // --- VALIDATION: Check if all path fields are selected ---
  const isPathSelected = formData.classId !== "" && formData.subjectName !== "" && formData.chapterName !== "";

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error("File is empty!");

        const firstRow = data[0];
        if (type === 'mcq') {
          const hasOptions = 'A' in firstRow && 'B' in firstRow && 'C' in firstRow && 'D' in firstRow;
          if (!hasOptions) {
            toast.error("Invalid Format! MCQs require A, B, C, D columns.");
            setBulkLoading(false);
            return;
          }
        }

        toast.loading(`Injecting ${data.length} items...`, { id: 'bulk' });

        for (const row of data) {
          await axios.post(`${API_URL}/add-question`, {
            ...formData,
            type,
            newQuestion: {
              q_no: Date.now() + Math.random(),
              question: row.question,
              options: type === 'mcq' ? { A: row.A, B: row.B, C: row.C, D: row.D } : undefined,
              answer: String(row.answer || ""),
              topic: row.topic || formData.topic || "General"
            }
          });
        }
        toast.success("Database Synced!", { id: 'bulk' });
        fetchDB();
      } catch (err: any) {
        toast.error(err.message || "Upload Failed");
      } finally {
        setBulkLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPathSelected) return toast.error("Please select Class, Subject & Chapter first!");
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/add-question`, {
        ...formData,
        type,
        newQuestion: {
          q_no: Date.now(),
          question: formData.question,
          options: type === 'mcq' ? formData.options : undefined,
          answer: formData.answer,
          topic: isNewTopic ? formData.topic : (formData.topic || "General")
        }
      });
      toast.success("Saved Successfully!");
      setFormData({ ...formData, question: "", answer: "", options: { A: "", B: "", C: "", D: "" } });
    } catch (err) {
      toast.error("Push failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FCFCFD] text-slate-800 overflow-hidden font-sans">
      <Toaster position="top-center" />
      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/60 p-3 md:p-8">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* TYPE SELECTOR */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-md shadow-sm border border-slate-200">
                {['mcq', 'short', 'long'].map(t => (
                  <button 
                    key={t} onClick={() => setType(t)}
                    className={`px-8 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${type === t ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 1: HIERARCHY BOX */}
            <div className="bg-white rounded-xl p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-slate-900"><Layers size={140} /></div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="col-span-full flex items-center gap-3 mb-2">
                  <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                  <span className="text-[15px] font-black uppercase tracking-widest text-slate-900">Select and Add Data</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1"><Tag size={12}/> Class</label>
                  <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value, subjectName: "", chapterName: ""})} className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-sm">
                    <option value="">Select Class</option>
                    {classesList.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1"><BookOpen size={12}/> Subject</label>
                  <select disabled={!formData.classId} value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value, chapterName: ""})} className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-sm disabled:opacity-40">
                    <option value="">Select Subject</option>
                    {availableSubjects.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1"><Layers size={12}/> Chapter</label>
                  <select disabled={!formData.subjectName} value={formData.chapterName} onChange={(e) => setFormData({...formData, chapterName: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-sm disabled:opacity-40">
                    <option value="">Select Chapter</option>
                    {availableChapters.map((ch: any, i: number) => <option key={i} value={ch.name}>{ch.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Topic Area</label>
                    <button onClick={() => setIsNewTopic(!isNewTopic)} className="text-[9px] font-black text-blue-600 uppercase hover:underline">{isNewTopic ? 'Select' : 'Create+'}</button>
                  </div>
                  {isNewTopic ? (
                    <input type="text" placeholder="Topic Name..." value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-blue-50/50 p-4 rounded-2xl border-2 border-blue-200 outline-none font-bold text-sm" />
                  ) : (
                    <select value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 transition-all outline-none font-bold text-sm">
                      <option value="">General</option>
                      {availableTopics?.map((t: string, i: number) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1"><Info size={12}/> Section</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-indigo-50/50 text-indigo-700 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-sm">
                    <option value="Exercise Questions">Exercise</option>
                    <option value="Additional Questions">Additional</option>
                    <option value="Pastpapers Questions">Pastpapers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2: MODE SELECTOR */}
            <div className="flex p-2 bg-slate-200/40 backdrop-blur-sm rounded-md gap-3 max-w-md shadow-inner">
              <button onClick={() => setInputMode("manual")} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-md text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${inputMode === "manual" ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-500'}`}>
                Manual Type
              </button>
              <button onClick={() => setInputMode("excel")} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-md text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${inputMode === "excel" ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-500'}`}>
                Upload Excel File
              </button>
            </div>

            {/* STEP 3: WORKSPACE (Locked until Path Selected) */}
            <div className={`min-h-[550px] mb-2 transition-all duration-500 ${!isPathSelected ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              {!isPathSelected && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                   <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold animate-bounce uppercase">
                      ⚠️ Please select Class, Subject & Chapter
                   </div>
                </div>
              )}

              {inputMode === "manual" ? (
                <form onSubmit={handleSaveManual} className="bg-white rounded-md p-12 shadow-2xl shadow-slate-200/70 border border-slate-100 space-y-10">
                  <div className="space-y-2">
                    <textarea required rows={1} value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} className="w-full bg-slate-100 p-4 rounded-md border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-md resize-none shadow-inner" placeholder="Enter question statement here..."></textarea>
                  </div>

                  {type === 'mcq' && (
                    <div className="grid grid-cols-4 gap-2">
                      {['A', 'B', 'C', 'D'].map(o => (
                        <div key={o} className="relative group">
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 text-lg">{o}</span>
                          <input type="text" placeholder={`Option ${o}`} value={(formData.options as any)[o]} onChange={(e) => setFormData({...formData, options: {...formData.options, [o]: e.target.value}})} className="w-full bg-white border-2 border-slate-100 p-3 pl-13 rounded-md outline-none focus:border-blue-500 transition-all text-lg" />
                        </div>
                      ))}
                      <div className="md:col-span-2 space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Select Correct Answer</label>
                        <div className="flex gap-4">
                          {['A','B','C','D'].map(a => (
                            <button key={a} type="button" onClick={() => setFormData({...formData, answer: a})} className={`flex-1 py-3 rounded-md border font-black text-xl transition-all ${formData.answer === a ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'bg-slate-50 text-slate-300'}`}>{a}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {type !== 'mcq' && (
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-3">Reference Key</label>
                      <textarea rows={4} value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} className="w-full bg-slate-100 p-6 rounded-md outline-none font-medium text-lg shadow-inner" placeholder="Provide the solution..."></textarea>
                    </div>
                  )}

                  <button disabled={loading} className="group w-full bg-slate-900 text-white p-3 rounded-md font-black uppercase text-lg hover:bg-slate-700 transition-all shadow-2xl flex items-center justify-center gap-5 active:scale-[0.98]">
                    {loading ? <Loader2 className="animate-spin" /> : <> <DatabaseZap size={22} className="text-blue-400" /> Store in Database <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" /></>}
                  </button>
                </form>
              ) : (
                <div className="bg-white rounded-md p-5 shadow-2xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center justify-center space-y-10">
                  <div className="w-40 h-40 bg-green-50 rounded-[3rem] flex items-center justify-center text-green-600 shadow-inner group relative">
                     <UploadCloud size={60} className="relative z-10" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-slate-400 text-[13px] uppercase bg-slate-50 px-6 py-2 rounded-full flex items-center gap-2">
                       <AlertCircle size={14} className="text-orange-400"/> Validation: {type === 'mcq' ? "question, A, B, C, D, answer, topic" : "question, answer, topic"}
                    </p>
                  </div>
                  <input type="file" id="bulk-input" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} disabled={bulkLoading} />
                  <label htmlFor="bulk-input" className="bg-slate-900 text-white px-10 py-4 rounded-md uppercase cursor-pointer hover:bg-slate-700 transition-all shadow-2xl flex items-center gap-4 group">
                    {bulkLoading ? <Loader2 className="animate-spin" /> : <FileSpreadsheet size={24} />}
                    {bulkLoading ? "Checking File..." : "Import File"}
                  </label>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WhiteAdminPanel;