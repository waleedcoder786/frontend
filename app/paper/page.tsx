'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaPrint, FaTrash, FaEdit, FaCheck, FaCloudUploadAlt } from "react-icons/fa";
import axios from 'axios';
import Navbar from '../components/navbar/page';
import QuestionMenuModal from '../components/QuestionMenuModal/page';
import toast from 'react-hot-toast';

interface PaperPreviewProps {
    className: string;
    subject: any;
    chapters: string[];
    onClose: () => void;
}

export default function PaperPreview({ className, subject, chapters, onClose }: PaperPreviewProps) {
    const paperRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // 🔹 Naya state: Har section ki settings (total, attempt etc) save karne ke liye
    const [sectionConfigs, setSectionConfigs] = useState<{ [key: string]: any }>({});

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [paperName, setPaperName] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // --- Add Questions Logic ---
    const handleAddQuestions = (newQs: any[], config: any) => {
        const sanitizedQs = newQs.map(q => ({
            ...q,
            marks: Number(q.marks) || (q.type === 'mcqs' ? 1 : q.type === 'shorts' ? 2 : 5),
            tempId: q.tempId || `${q.id || Math.random()}-${Date.now()}`
        }));

        // Agar Modal se config aayi hai to use save karein
        if (config && config.type) {
            setSectionConfigs(prev => ({
                ...prev,
                [config.type.toLowerCase()]: config
            }));
        }

        setSelectedQuestions(prev => [...prev, ...sanitizedQs]);
        setIsMenuOpen(false);
    };

    const removeQuestion = (tempId: string) => {
        setSelectedQuestions(prev => prev.filter((q) => q.tempId !== tempId));
    };

    // --- Calculations ---
    const mcqs = selectedQuestions.filter(q => q.type?.toLowerCase() === 'mcqs');
    const shorts = selectedQuestions.filter(q => q.type?.toLowerCase() === 'shorts');
    const longs = selectedQuestions.filter(q => q.type?.toLowerCase() === 'longs');

    const calculateTotal = (questions: any[]) => questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    const totalMcqMarks = calculateTotal(mcqs);
    const totalShortMarks = calculateTotal(shorts);
    const totalLongMarks = calculateTotal(longs);
    const grandTotalMarks = totalMcqMarks + totalShortMarks + totalLongMarks;

    // --- Save to DB Logic ---
    const handleSavePaper = async (paperName: string) => {
        if (!selectedQuestions.length) {
            toast.error("Please add some questions before saving.");
            return;
        }

        setIsLoading(true);
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                toast.error("Session expired. Please login.");
                return;
            }

            const currentUser = JSON.parse(storedUser);

            const payload = {
                id: Date.now(),
                userId: currentUser.id,
                paperName,
                MCQs: mcqs,
                Short: shorts,
                Long: longs,
                sectionConfigs, // Config bhi save kar rahe hain taake baad mein load ho sake
                info: {
                    subject: subject?.name,
                    class: className,
                    totalMarks: grandTotalMarks,
                    createdAt: new Date().toLocaleString()
                }
            };

            const response = await axios.post("http://localhost:3001/papers", payload);

            if (response.status === 201) {
                toast.success("Paper saved successfully!");
                setIsEditMode(false);
                setPaperName("");
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Database error: Could not save paper.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleModal = () => {
        if (!selectedQuestions.length) {
            toast.error("Please add some questions before saving.");
            return;
        }
        setIsSaveModalOpen(true);
    }

    return (
        <div className="flex h-screen w-screen bg-slate-200 overflow-hidden font-sans">
            <Navbar />

            <QuestionMenuModal
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                subjectName={subject?.name}
                chapters={chapters}
                className={className}
                onAddQuestions={handleAddQuestions}
            />

            {/* SAVE MODAL */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4 text-black">Save Paper</h2>
                        <input
                            type="text"
                            placeholder="Enter paper name"
                            value={paperName}
                            onChange={(e) => setPaperName(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-bold">Cancel</button>
                            <button
                                onClick={() => { handleSavePaper(paperName); setIsSaveModalOpen(false); }}
                                disabled={!paperName.trim() || isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 font-bold disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* --- TOOLBAR --- */}
                <div className="bg-[#0f172a] text-white h-16 flex items-center justify-between px-6 border-b border-white/10 z-50 shrink-0 print:hidden shadow-2xl">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMenuOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg">
                            <FaBars className="text-[10px]" /> ADD QUESTIONS
                        </button>

                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`${isEditMode ? 'bg-green-600 hover:bg-green-500' : 'bg-amber-600 hover:bg-amber-500'} text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg`}
                        >
                            {isEditMode ? <><FaCheck /> SAVE TEXT</> : <><FaEdit /> EDIT TEXT</>}
                        </button>

                        <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-yellow-400 border border-slate-700">
                            <FaPrint className="text-[10px]" /> PRINT
                        </button>

                        <button onClick={handleModal} disabled={isLoading} className="bg-slate-800 hover:bg-slate-700 text-[12px] px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-green-400 border border-slate-700 disabled:opacity-50">
                            {isLoading ? <div className="w-4 h-4 border-2 border-green-400 border-t-transparent animate-spin rounded-full" /> : <FaCloudUploadAlt />}
                            {isLoading ? "SAVING..." : "SAVE TO DB"}
                        </button>
                    </div>

                    <div className="flex items-center bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-2xl px-2 py-1.5 gap-2">
                        <span className="text-[10px] font-bold px-3 text-slate-400">Total Marks: {grandTotalMarks}</span>
                    </div>

                    <button onClick={onClose} className="hover:bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 group">
                        <FaTrash /> EXIT
                    </button>
                </div>

                {/* --- PAPER SHEET AREA --- */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-400/20 print:p-0 print:bg-white custom-scrollbar">
                    <div
                        ref={paperRef}
                        className={`bg-white mx-auto w-[850px] min-h-[1100px] shadow-2xl relative p-16 print:shadow-none print:w-full print:p-12 text-black transition-all ${isEditMode ? 'ring-4 ring-amber-400 outline-none' : ''}`}
                    >
                        {/* Paper Header */}
                        <div className="border-b-4 border-black pb-4 text-center mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Standardized Examination</h1>
                            <div className="flex justify-between mt-8 text-[15px] font-bold">
                                <span>Class: {className}</span>
                                <span className="text-xl underline decoration-double underline-offset-4">Subject: {subject?.name}</span>
                                <span>Max Marks: {grandTotalMarks}</span>
                            </div>
                        </div>

                        {/* Section A - MCQs */}
                        {mcqs.length > 0 && (
                            <div className="mb-8" contentEditable={isEditMode} suppressContentEditableWarning={true}>
                                <div className="flex justify-between border-b-2 border-black mb-2 font-black italic">
                                    <span>Section-A (Objective)</span>
                                    <span>Marks: {totalMcqMarks}</span>
                                </div>
                                <div className="space-y-4">
                                    {mcqs.map((q, idx) => (
                                        <div key={q.tempId} className="group relative">
                                            {!isEditMode && (
                                                <button onClick={() => removeQuestion(q.tempId)} className="absolute -left-10 text-red-500 opacity-0 group-hover:opacity-100 print:hidden"><FaTrash size={10} /></button>
                                            )}
                                            <p className="font-bold flex gap-2 text-[14px]">
                                                <span>{idx + 1}.</span> <span>{q.question || q.text}</span>
                                            </p>
                                            <div className="flex gap-x-8 mt-1 ml-6 text-[13px]">
                                                {Object.entries(q.options || {}).map(([key, val]: any) => (
                                                    <div key={key} className="flex gap-1"><span className="font-bold">({key})</span> {val}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section B - Short Questions */}
                        {shorts.length > 0 && (
                            <div className="mb-8" contentEditable={isEditMode} suppressContentEditableWarning={true}>
                                <div className="flex justify-between border-b-2 border-black mb-1 font-black italic">
                                    <span>Section-B (Short Questions)</span>
                                    <span>Marks: {totalShortMarks}</span>
                                </div>
                                
                                {/* 🔹 Choice logic for Shorts */}
                                {sectionConfigs['shorts']?.attempt < sectionConfigs['shorts']?.total && (
                                    <p className="text-[13px] font-bold mb-3 italic">
                                        Note: Attempt any {sectionConfigs['shorts'].attempt} questions out of {sectionConfigs['shorts'].total}.
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {shorts.map((q, idx) => (
                                        <div key={q.tempId} className="group relative flex gap-2 text-[14px]">
                                            {!isEditMode && (
                                                <button onClick={() => removeQuestion(q.tempId)} className="absolute -left-10 text-red-500 opacity-0 group-hover:opacity-100 print:hidden"><FaTrash size={10} /></button>
                                            )}
                                            <span className="font-bold">({idx + 1})</span>
                                            <span>{q.question || q.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section C - Long Questions */}
                        {longs.length > 0 && (
                            <div className="mb-8" contentEditable={isEditMode} suppressContentEditableWarning={true}>
                                <div className="flex justify-between border-b-2 border-black mb-1 font-black italic">
                                    <span>Section-C (Detailed Questions)</span>
                                    <span>Marks: {totalLongMarks}</span>
                                </div>

                                {/* 🔹 Choice logic for Longs */}
                                {sectionConfigs['longs']?.attempt < sectionConfigs['longs']?.total && (
                                    <p className="text-[13px] font-bold mb-3 italic">
                                        Note: Attempt any {sectionConfigs['longs'].attempt} questions out of {sectionConfigs['longs'].total}.
                                    </p>
                                )}

                                <div className="space-y-6">
                                    {longs.map((q, idx) => (
                                        <div key={q.tempId} className="group relative flex gap-2 text-[15px]">
                                            {!isEditMode && (
                                                <button onClick={() => removeQuestion(q.tempId)} className="absolute -left-10 text-red-500 opacity-0 group-hover:opacity-100 print:hidden"><FaTrash size={10} /></button>
                                            )}
                                            <span className="font-black">Q.{idx + 1}</span>
                                            <span className="font-bold">{q.question || q.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                  body { background: white !important; }
                  .print-hidden { display: none !important; }
                  @page { size: A4; margin: 15mm; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}