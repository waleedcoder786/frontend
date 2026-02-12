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
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
} from "react-icons/hi";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api/papers";

interface Paper {
  id: string;
  paperName: string;
  className?: string;
  subject?: string;
  createdAt: string;
  userId: string;
}

function SavedPapersPage() {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      fetchPapers(parsedUser.id || parsedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPapers = async (idFromStorage: string) => {
    if (!idFromStorage) return;
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: { userId: idFromStorage },
      });
      
      const formattedData = res.data.map((p: any) => ({
        ...p,
        id: p._id || p.id
      }));
      
      setSavedPapers(formattedData);
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = useMemo(() => {
    return savedPapers.filter((paper) => {
      const matchesSearch = paper.paperName.toLowerCase().includes(searchQuery.toLowerCase());
      const myId = currentUser?.id || currentUser?._id;
      if (filterType === "mine") {
        return matchesSearch && paper.userId === myId;
      } else if (filterType === "teachers") {
        return matchesSearch && paper.userId !== myId;
      }
      return matchesSearch;
    });
  }, [searchQuery, savedPapers, filterType, currentUser]);

  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPapers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPapers, currentPage]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const handleDelete = async () => {
    if (!paperToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/${paperToDelete}`);
      setSavedPapers((prev) => prev.filter((p) => p.id !== paperToDelete));
      toast.success("Paper deleted successfully");
      setIsModalOpen(false);
      setPaperToDelete(null);
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete paper");
    } finally {
      setIsDeleting(false);
    }
  };

  // Modal close handler for user friendliness
  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setPaperToDelete(null);
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#F8FAFC] font-sans">
      <Navbar />

      {/* Delete Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl border border-slate-100 text-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Paper?</h3>
            <p className="text-slate-500 text-sm mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={closeDeleteModal} 
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" onClick={() => setOpenMenuId(null)}>
        <Header />
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Papers</h1>
                <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest">
                  {filteredPapers.length} {filterType === 'teachers' ? 'Teacher' : 'Total'} Documents
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                  {['all', 'mine', 'teachers'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="relative group w-full md:w-64">
                  <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Grid Content */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium">No papers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedPapers.map((paper) => {
                  const isTeacherPaper = paper.userId !== (currentUser?.id || currentUser?._id);
                  
                  return (
                    <div key={paper.id} className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300">
                      
                      {isTeacherPaper && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 z-10">
                          <HiOutlineUserGroup /> TEACHER
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTeacherPaper ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
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
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                              <Link href={`/view-paper/${paper.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                                <HiOutlineEye className="text-blue-500" size={16} /> View Paper
                              </Link>
                              <Link href={`/editpaper/${paper.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                                <HiOutlinePencil className="text-emerald-500" size={16} /> Edit Details
                              </Link>
                              <button 
                                onClick={(e) => { 
                                    e.stopPropagation();
                                    setPaperToDelete(paper.id); 
                                    setIsModalOpen(true); 
                                    setOpenMenuId(null);
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 text-xs font-bold transition-colors border-t border-slate-50"
                              >
                                <HiOutlineTrash size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 capitalize line-clamp-1 mb-3">{paper.paperName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                            <HiOutlineAcademicCap size={14} />
                            <span>Class: {paper.className || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                            <HiOutlineCalendar size={14} />
                            <span>{new Date(paper.createdAt).toLocaleDateString("en-GB")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${isTeacherPaper ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {paper.subject || "General"}
                        </span>
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                          <HiOutlineDownload size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="mt-10 flex items-center justify-center gap-4">
                 <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-blue-500 transition-all shadow-sm"
                 >
                   <HiOutlineChevronLeft size={20}/>
                 </button>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Page {currentPage} of {totalPages}</span>
                 <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-blue-500 transition-all shadow-sm"
                 >
                   <HiOutlineChevronRight size={20}/>
                 </button>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SavedPapersPage;