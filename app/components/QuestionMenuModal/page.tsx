'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, FaSearch, FaCheckSquare, FaArrowLeft, 
  FaSpinner, FaDatabase, FaRandom, FaListUl, FaLayerGroup, FaColumns 
} from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  className: string;
  chapters: string[]; 
  onAddQuestions: (questions: any[], config: any) => void;
  editData?: any; 
}

export default function QuestionMenuModal({ 
  isOpen, 
  onClose, 
  subjectName, 
  onAddQuestions, 
  className, 
  chapters,
  editData 
}: ModalProps) {
  
  const [viewMode, setViewMode] = useState<'filters' | 'selection'>('filters');
  const [tempSelected, setTempSelected] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('MCQs'); 
  const [selectedSource, setSelectedSource] = useState('Exercise Questions');
  const [requiredCount, setRequiredCount] = useState<number>(10);
  const [defaultMarks, setDefaultMarks] = useState<number>(1);
  const [attemptCount, setAttemptCount] = useState<number>(8);
  const [layoutCols, setLayoutCols] = useState<number>(1); // New State for Column Selection
  
  const [displayQuestions, setDisplayQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOnlySelected, setFilterOnlySelected] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);   
  // const API_BASE = "http://localhost:5000/api"; 
  const  API_BASE = 'https://backendrepoo-production.up.railway.app/api/classes';


  // --- EDIT MODE LOGIC ---
  useEffect(() => {
    if (isOpen && editData && !isInitialLoad) {
      setSelectedType(editData.config.typeName || 'MCQs');
      setRequiredCount(editData.config.total);
      setAttemptCount(editData.config.attempt);
      setDefaultMarks(editData.config.marks);
      setLayoutCols(editData.config.layoutCols || 1); // Load existing layout
      setTempSelected(editData.questions);
      setDisplayQuestions(editData.questions);
      
      setViewMode('selection');
      setFilterOnlySelected(true); 
      setIsInitialLoad(true);
    } 
    
    if (!isOpen) {
      setViewMode('filters');
      setTempSelected([]);
      setDisplayQuestions([]);
      setFilterOnlySelected(false);
      setIsInitialLoad(false);
    }
  }, [isOpen, editData, isInitialLoad]);

  // Marks auto-update logic
  useEffect(() => {
    if(!editData || (isOpen && viewMode === 'filters')) {
        const type = selectedType.toLowerCase();
        if (type.includes('mcq')) {
            setDefaultMarks(1);
            setAttemptCount(requiredCount);
            setLayoutCols(1); // MCQs usually full width in filters but adjustable later
        } else if (type.includes('short')) {
            setDefaultMarks(2);
            setAttemptCount(Math.min(8, requiredCount)); 
        } else if (type.includes('long')) {
            setDefaultMarks(5);
            setAttemptCount(Math.min(3, requiredCount));
        }
    }
  }, [selectedType, requiredCount, editData, isOpen, viewMode]);

  if (!isOpen) return null;

  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  // const handleSearchTrigger = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get(`${API_BASE}/classes`);
  //     let rootData = response.data;
  //     if (Array.isArray(rootData) && rootData.length > 0) {
  //       if (rootData[0].chaptersData || rootData[0].classes) {
  //           rootData = rootData[0]; 
  //       }
  //     }
  //     const chaptersSource = rootData.chaptersData || rootData.classes || (Array.isArray(rootData) ? rootData : null);

  //     if (!chaptersSource) {
  //       alert("Error: Data structure mismatch.");
  //       return;
  //     }

  //     const classKey = className.replace(/\D/g, ''); 
  //     let classData;
  //     if (Array.isArray(chaptersSource)) {
  //         classData = chaptersSource.find((c: any) => 
  //            String(c.id) === classKey || String(c.title || c.className).includes(classKey)
  //         );
  //     } else {
  //         classData = chaptersSource[classKey] || chaptersSource[className];
  //     }

  //     if (classData && classData.subjects) {
  //       const targetSubject = classData.subjects.find((sub: any) => 
  //           sub.name.toLowerCase() === subjectName.toLowerCase()
  //       );
        
  //       if (targetSubject?.chapters) {
  //         let allQuestions: any[] = [];
  //         const filteredChapters = targetSubject.chapters.filter((ch: any) => 
  //             chapters.includes(ch.name)
  //         );

  //         filteredChapters.forEach((chapter: any) => {
  //           const typeKey = Object.keys(chapter).find(k => 
  //               k.toLowerCase().startsWith(selectedType.toLowerCase().substring(0, 4))
  //           );
  //           const categoryData = typeKey ? chapter[typeKey] : null;

  //           if (categoryData) {
  //               if (Array.isArray(categoryData) && categoryData[0] && typeof categoryData[0] === 'object' && !categoryData[0].question) {
  //                   const sourceList = categoryData[0][selectedSource] || [];
  //                   allQuestions = [...allQuestions, ...sourceList];
  //               } 
  //               else if (Array.isArray(categoryData)) {
  //                   allQuestions = [...allQuestions, ...categoryData];
  //               }
  //           }
  //         });

  //         const questionsWithTags = allQuestions.map((q, i) => ({ 
  //           ...q, 
  //           type: selectedType.toLowerCase(),
  //           marks: defaultMarks, 
  //           tempId: `${selectedType}-${q.id || i}-${Math.random().toString(36).substr(2, 9)}`
  //         }));
          
  //         if (questionsWithTags.length === 0) {
  //             alert("No questions found.");
  //         }

  //         setDisplayQuestions(questionsWithTags);
  //         setViewMode('selection');
  //         setFilterOnlySelected(false);
  //       }
  //     }
  //   } catch (error: any) {
  //     alert("Network Error: Could not connect to database.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSearchTrigger = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_BASE}/classes`);
    let rootData = response.data;

    // Normalizing root data
    if (Array.isArray(rootData)) rootData = rootData[0];
    const chaptersSource = rootData.classes || rootData.chaptersData || [];

    // 1. Find Class
    const classKey = className.replace(/\D/g, ''); 
    const classData = chaptersSource.find((c: any) => String(c.id) === classKey);

    if (classData && classData.subjects) {
      // 2. Find Subject
      const targetSubject = classData.subjects.find((sub: any) => 
          sub.name.toLowerCase().trim() === subjectName.toLowerCase().trim()
      );
      
      if (targetSubject?.chapters) {
        let allQuestions: any[] = [];

        // 3. Filter Chapters
        const filteredChapters = targetSubject.chapters.filter((ch: any) => {
          const chName = typeof ch === 'string' ? ch : ch.name;
          return chapters.includes(chName);
        });

        filteredChapters.forEach((chapter: any) => {
          // Skip if chapter is just a string (no data)
          if (typeof chapter === 'string') return;

          // Find Key (MCQs, shorts, longs)
          const typeKey = Object.keys(chapter).find(k => 
              k.toLowerCase().startsWith(selectedType.toLowerCase().substring(0, 3))
          );

          if (typeKey && chapter[typeKey]) {
            const typeData = chapter[typeKey];

            // AGAR DATA IS TARAH HAI: MCQs -> "Exercise Questions" -> []
            if (typeData[selectedSource]) {
               allQuestions = [...allQuestions, ...typeData[selectedSource]];
            } 
            // AGAR DATA DIRECT ARRAY HAI: MCQs -> []
            else if (Array.isArray(typeData)) {
               allQuestions = [...allQuestions, ...typeData];
            }
          }
        });

        // 4. Map questions with unique IDs
        const questionsWithTags = allQuestions.map((q, i) => ({ 
          ...q, 
          type: selectedType.toLowerCase(),
          marks: defaultMarks, 
          tempId: `${selectedType}-${i}-${Math.random().toString(36).substr(2, 5)}`
        }));
        
        if (questionsWithTags.length === 0) {
            alert(`No ${selectedType} found in ${selectedSource}`);
        }

        setDisplayQuestions(questionsWithTags);
        setViewMode('selection');
        setFilterOnlySelected(false);
      } else {
        alert("Subject or Chapters missing in DB");
      }
    }
  } catch (error: any) {
    console.error("Search Error:", error);
    alert("Database Connection Error");
  } finally {
    setIsLoading(false);
  }
};



  const handleRandomSelect = () => {
    setFilterOnlySelected(false);
    const shuffled = shuffle(displayQuestions);
    const limit = Number(requiredCount);
    setTempSelected(shuffled.slice(0, limit));
  };

  const toggleSelection = (q: any) => {
    const isSelected = tempSelected.some(item => item.tempId === q.tempId);
    if (isSelected) {
      setTempSelected(tempSelected.filter(item => item.tempId !== q.tempId));
    } else if (tempSelected.length < Number(requiredCount)) {
      setTempSelected([...tempSelected, q]);
    }
  };

  const visibleQuestions = filterOnlySelected 
    ? displayQuestions.filter(q => tempSelected.some(s => s.tempId === q.tempId))
    : displayQuestions;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 font-sans text-black">
      <div className="bg-[#fcfdfe] w-full max-w-6xl rounded-sm shadow-2xl overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-8 py-2 flex justify-between items-center border-b-4 border-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-sm shadow-lg shadow-blue-500/30">
              <FaDatabase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editData ? `Editing Batch` : subjectName}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class {className} • {chapters.length} Chapters</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-red-500 p-2 rounded-full transition-all bg-slate-800"><FaTimes size={20} /></button>
        </div>

        {viewMode === 'filters' ? (
          <div className="p-10 space-y-10">
            {/* GRID UPDATED TO ACCOMMODATE LAYOUT OPTION */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6`}>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Category</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} 
                        className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm">
                  <option value="MCQs">MCQs (Objectives)</option>
                  <option value="shorts">Short Questions</option>
                  <option value="longs">Long Questions</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Source Material</label>
                <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}
                        className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm">
                  <option value="Exercise Questions">Exercise Questions</option>
                  <option value="Additional Questions">Additional Questions</option>
                  <option value="Pastpapers Questions">Past Board Papers</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Total Qs</label>
                <input type="number" value={requiredCount} onChange={(e) => setRequiredCount(Number(e.target.value))} 
                       className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm" />
              </div>

              {!selectedType.toLowerCase().includes('mcq') && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase ml-1">To Attempt</label>
                  <input type="number" value={attemptCount} onChange={(e) => setAttemptCount(Number(e.target.value))} 
                          className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-blue-700 shadow-sm" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1">Marks/Q</label>
                <input type="number" value={defaultMarks} onChange={(e) => setDefaultMarks(Number(e.target.value))} 
                       className="bg-white border-2 border-slate-100 rounded-xl p-4 font-bold outline-none focus:border-blue-600 text-slate-700 shadow-sm" />
              </div>

              {/* NEW LAYOUT OPTION: Appears for Shorts and Longs */}
              {!selectedType.toLowerCase().includes('mcq') && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-black text-purple-600 uppercase ml-1">Qs Per Row</label>
                  <select value={layoutCols} onChange={(e) => setLayoutCols(Number(e.target.value))}
                          className="bg-purple-50 border-2 border-purple-100 rounded-xl p-4 font-bold outline-none focus:border-purple-600 text-purple-700 shadow-sm">
                    <option value={1}>1 Question/Row</option>
                    <option value={2}>2 Questions/Row</option>
                  </select>
                </div>
              )}
            </div>

            <button onClick={handleSearchTrigger} disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-4 uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-50">
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              {isLoading ? "Fetching Data..." : "Find Questions"}
            </button>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex justify-between items-center mb-3 text-black">
              <button 
                onClick={() => setViewMode('filters')} 
                className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs hover:underline"
              >
                <FaArrowLeft /> Back to Filters
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm font-black text-[10px] flex items-center gap-2">
                   <FaColumns /> LAYOUT: {layoutCols} COL
                </div>
                <div className="bg-blue-600 text-white px-6 py-1.5 rounded-sm shadow-lg font-black text-xs">
                  SELECTED: {tempSelected.length} / {requiredCount}
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar mb-6">
              {visibleQuestions.length > 0 ? visibleQuestions.map((q, idx) => {
                const isSelected = tempSelected.some(item => item.tempId === q.tempId);
                const isMCQ = selectedType.toLowerCase().includes('mcq');

                return (
                  <div key={q.tempId} onClick={() => toggleSelection(q)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex gap-5 ${
                        isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                      }`}>
                    <div className={`w-6 h-6 mt-1 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-slate-50'
                    }`}>
                      {isSelected && <FaCheckSquare size={12} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800 text-sm leading-snug">
                            <span className="text-blue-600 mr-2">{idx + 1}.</span> {q.question || q.text}
                          </p>
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded ml-2 whitespace-nowrap">
                            {q.marks} Marks
                          </span>
                      </div>

                      {isMCQ && q.options && (
                        <div className="grid grid-cols-2 gap-2 mt-3 ml-6">
                          {Object.entries(q.options).map(([key, value]) => (
                            <div key={key} className="text-[12px] flex items-center gap-2">
                              <span className="font-black text-blue-600">{key})</span>
                              <span className="text-slate-600 font-medium">{String(value)}</span>
                            </div>
                          ))}
                          {q.answer && (
                            <div className="col-span-2 mt-1 italic text-[10px] text-green-600 font-bold">
                              Correct: {q.answer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                    No Questions Found.
                </div>
              )}
            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t-2 border-slate-50">
              <button 
                onClick={() => setFilterOnlySelected(false)} 
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all ${!filterOnlySelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                <FaLayerGroup /> All
              </button>
              
              <button 
              onClick={() => setFilterOnlySelected(true)} 
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all ${filterOnlySelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                <FaListUl /> Selected
              </button>
              
              <button 
                onClick={handleRandomSelect} 
                className="flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-purple-700 transition-all shadow-lg"
              >
                <FaRandom /> Random Pick
              </button>
              
              <button 
                disabled={tempSelected.length < Number(requiredCount)}
                onClick={() => { 
                  onAddQuestions(tempSelected, { 
                    total: requiredCount, 
                    attempt: attemptCount, 
                    marks: defaultMarks, 
                    type: selectedType,
                    layoutCols: layoutCols // Included in the config object
                  }); 
                  onClose(); 
                }} 
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase text-xs transition-all shadow-lg
                  ${tempSelected.length < Number(requiredCount) 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {editData ? "Update Paper" : "Add In Paper"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
