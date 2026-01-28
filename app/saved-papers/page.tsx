"use client";
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { CiSearch } from "react-icons/ci";
import { HiOutlineDocumentText, HiOutlineEye, HiOutlineTrash, HiOutlineExclamation, HiOutlinePencil } from "react-icons/hi";
import axios from "axios";
import Link from "next/link";

interface Paper {
  id: string;
  paperName: string;
  info?: {
    createdAt: string;
  };
}

function SavedPapersPage() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Delete States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userID, setUserID] = useState<({ id: string } | null)> (null);


  // Sirf ek useEffect kafi hai
useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserID(parsedUser); // State update karein
        
        // State update ka intezar karne ke bajaye seedha parsed data pass karein
        fetchPapers(parsedUser.id); 
    } else {
        setLoading(false);
    }
}, []);

const fetchPapers = async (idFromStorage: string) => {
    // Agar id nahi mili toh function yahi rok dein
    if (!idFromStorage) return;

    setLoading(true);
    try {
        console.log("Fetching papers for User ID:", idFromStorage);
        
        const res = await axios.get("http://localhost:3001/papers", {
            params: { userId: idFromStorage },
        });
        
        setSavedPapers(res.data);
    } catch (error) {
        console.error("Error fetching papers:", error);
    } finally {
        setLoading(false);
    }
};

  // --- SEARCH LOGIC ---
  const filteredPapers = useMemo(() => {
    return savedPapers.filter((paper) =>
      paper.paperName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, savedPapers]);

  const confirmDelete = (id: string) => {
    setPaperToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      // NOTE: Ensure your backend has app.delete('/papers/:id')
      await axios.delete(`http://localhost:3001/papers/${paperToDelete}`);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paperToDelete));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Backend error: Check if the route exists.");
    } finally {
      setIsDeleting(false);
      setPaperToDelete(null);
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Navbar />
      
      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl border border-slate-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Delete Paper?</h3>
            <p className="text-slate-500 text-sm text-center mt-2">
              This will permanently remove the test paper from your records.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all text-sm disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Top Bar: Title & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Papers</h1>
                <p className="text-slate-500 mt-1">Found {filteredPapers.length} saved documents</p>
              </div>

              <div className="relative group w-full md:w-96">
                <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by paper name..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Table UI */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-20 text-center text-slate-400 animate-pulse">Fetching your papers...</div>
              ) : filteredPapers.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
                    <HiOutlineDocumentText size={40} />
                  </div>
                  <p className="text-slate-500 font-medium">{searchQuery ? "No matches found." : "No papers saved yet."}</p>
                </div>
              ) : (
                <table className="w-full text-left border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Document</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Created On</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPapers.map((paper) => (
                      <tr key={paper.id} className=" hover:bg-blue-50/30 transition-all">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <HiOutlineDocumentText size={20} />
                            </div>
                            <span className="font-semibold text-slate-700">{paper.paperName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {paper.info?.createdAt || "N/A"}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2  transition-opacity">
                           <Link href={`/view-paper/${paper.id}`}>
                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                              <HiOutlineEye size={20} />
                            </button>
                            </Link>
                           <Link href={`/editpaper/${paper.id}`}>
                              <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                <HiOutlinePencil size={20} />
                                </button>
                            </Link>
                              <button 
                              onClick={() => confirmDelete(paper.id)}
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                            >
                              <HiOutlineTrash size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SavedPapersPage;