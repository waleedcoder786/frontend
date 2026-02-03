"use client";
import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/navbar/page";
import Header from "../components/topbar/page";
import { CiSearch } from "react-icons/ci";
import { HiOutlineDocumentText, HiOutlineEye, HiOutlineBookOpen, HiOutlineDotsVertical, HiOutlineDownload, HiOutlineTrash, HiOutlineExclamation, HiOutlinePencil, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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
    <div className="relative flex h-screen w-screen bg-[#F8FAFC] font-sans ">
      <Navbar />

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl border border-slate-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Delete Paper?</h3>
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
          <div className="max-w-5xl mx-auto space-y-8 pb-20">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Papers</h1>
                <p className="text-slate-500 mt-1">Found {filteredPapers.length} saved documents</p>
              </div>
              <div className="relative group w-full md:w-96">
                <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by paper name..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-sm text-gray-800"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-visible">
              {loading ? (
                <div className="p-20 text-center text-slate-400 animate-pulse">Fetching your papers...</div>
              ) : filteredPapers.length === 0 ? (
                <div className="p-20 text-center">
                   <p className="text-slate-500 font-medium">No papers found.</p>
                </div>
              ) : (
                <>
                  <div className="">
                    <table className="w-full text-left border-spacing-0">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Papers</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Class</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Subject</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPapers.map((paper, index) => (
                          <tr key={paper.id} className="group hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><HiOutlineDocumentText size={20} /></div>
                                <span className="font-semibold text-slate-700">{paper.paperName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 font-bold text-slate-600 text-sm">{paper?.info?.class || "N/A"}</td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-black uppercase">{paper?.info?.subject || "General"}</span>
                            </td>
                            <td className="px-6 py-5 text-slate-500 text-sm">{paper.info?.createdAt ? new Date(paper.info.createdAt).toLocaleDateString("en-GB") : "---"}</td>
                            <td className="px-10 py-4 text-right relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === paper.id ? null : paper.id);
                                }}
                                className="p-2 hover:bg-slate-200 rounded-lg text-gray-500">
                                <HiOutlineDotsVertical />
                              </button>

                              {openMenuId === paper.id && (
                                <div className={`absolute right-8 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-11110 animate-in fade-in zoom-in-95 duration-150 origin-top-right
                                  ${index >= paginatedPapers.length - 2 ? 'bottom-full mb-2 origin-bottom-right' : 'mt-2 origin-top-right'} 
                                `}>
                                  <Link href={`/view-paper/${paper.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm"><HiOutlineEye className="text-blue-600" size={18} />View</Link>
                                  <Link href={`/editpaper/${paper.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm"><HiOutlinePencil className="text-emerald-600" size={18} />Edit</Link>
                                  <Link href={``} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors">
                                  <HiOutlineDownload className="text-emerald-600" size={18} /> Download
                                </Link>
                                  <button onClick={() => confirmDelete(paper.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 font-bold text-sm border-t border-slate-50"><HiOutlineTrash size={18} /> Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between relative z-10">
                    <p className="text-sm text-slate-500 font-medium">
                      Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredPapers.length)}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 text-gray-400 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <HiOutlineChevronLeft size={20} />
                      </button>
                      <div className="flex items-center px-4 text-sm font-bold text-slate-700">
                        Page {currentPage} of {totalPages || 1}
                      </div>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 border border-gray-300 text-gray-400 rounded-lg hover:bg-white disabled:opacity-80 disabled:cursor-not-allowed transition-all">
                        <HiOutlineChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SavedPapersPage;