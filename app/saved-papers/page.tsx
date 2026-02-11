"use client";
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { CiSearch } from "react-icons/ci";
import { 
  HiOutlineDocumentText, 
  HiOutlineEye, 
  HiOutlineDotsVertical, 
  HiOutlineDownload, 
  HiOutlineTrash, 
  HiOutlineExclamation, 
  HiOutlinePencil, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineAcademicCap
} from "react-icons/hi";
import axios from "axios";
import Link from "next/link";

interface Paper {
  id: string;
  paperName: string;
  info?: {
    createdAt: string;
    class?: string;
    subject?: string;
  };
}

function SavedPapersPage() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Pagination States (Increased items per page for grid visibility)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Delete States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userID, setUserID] = useState<({ id: string } | null)>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserID(parsedUser);
      fetchPapers(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPapers = async (idFromStorage: string) => {
    if (!idFromStorage) return;
    setLoading(true);
    try {
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

  const filteredPapers = useMemo(() => {
    return savedPapers.filter((paper) =>
      paper.paperName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, savedPapers]);

  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPapers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPapers, currentPage]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const confirmDelete = (paperId: string) => {
    setPaperToDelete(paperId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3001/papers/${paperToDelete}`);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paperToDelete));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setIsDeleting(false);
      setPaperToDelete(null);
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#F8FAFC] font-sans">
      <Navbar />

      {/* Delete Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Paper?</h3>
            <p className="text-slate-500 text-sm mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Papers</h1>
                <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest">{filteredPapers.length} Documents Found</p>
              </div>
              <div className="relative group w-full md:w-96">
                <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-12 pr-4 py-3 text-gray-700 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Grid Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No papers found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedPapers.map((paper) => (
                  <div key={paper.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                    
                    {/* Header: Icon and Dropdown */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <HiOutlineDocumentText size={24} />
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === paper.id ? null : paper.id);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                          <HiOutlineDotsVertical size={20} />
                        </button>

                        {openMenuId === paper.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                            <Link href={`/view-paper/${paper.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                              <HiOutlineEye className="text-blue-500" size={18} /> View
                            </Link>
                            <Link href={`/editpaper/${paper.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                              <HiOutlinePencil className="text-emerald-500" size={18} /> Edit
                            </Link>
                            <button onClick={() => confirmDelete(paper.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors border-t border-slate-50">
                              <HiOutlineTrash size={18} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">{paper.paperName}</h3>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <HiOutlineAcademicCap size={16} />
                          <span>Class: {paper?.info?.class || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <HiOutlineCalendar size={16} />
                          <span>{paper.info?.createdAt ? new Date(paper.info.createdAt).toLocaleDateString("en-GB") : "Date N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subject Tag */}
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {paper?.info?.subject || "General"}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <HiOutlineDownload size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Grid Style */}
            {/* <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredPapers.length)}</span> of {filteredPapers.length}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <HiOutlineChevronLeft size={18} /> Prev
                </button>
                
                <span className="text-sm font-bold text-slate-700 px-2">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next <HiOutlineChevronRight size={18} />
                </button>
              </div>
            </div> */}

          </div>
        </div>
      </main>
    </div>
  );
}

export default SavedPapersPage;