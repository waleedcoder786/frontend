'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Trash2, Edit, ChevronDown, ChevronUp, GraduationCap, X, AlertTriangle } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [subAdmins, setSubAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null);

  // Modals States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: 'users' | 'teachers'} | null>(null);
  const [editType, setEditType] = useState<'users' | 'teachers'>('users');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'superadmin') {
      toast.error("Access Denied!");
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, teacherRes] = await Promise.all([
        axios.get('http://localhost:3001/users'),
        axios.get('http://localhost:3001/teachers')
      ]);
      const filteredSubAdmins = userRes.data.filter((u: any) => u.email !== "admin@creative.com");
      setSubAdmins(filteredSubAdmins);
      setTeachers(teacherRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (item: any, type: 'users' | 'teachers') => {
    setEditingItem({ ...item });
    setEditType(type);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/${editType}/${editingItem.id}`, editingItem);
      toast.success("Updated successfully!");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // --- DELETE LOGIC ---
  const confirmDelete = (id: string, type: 'users' | 'teachers') => {
    setDeletingItem({ id, type });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await axios.delete(`http://localhost:3001/${deletingItem.type}/${deletingItem.id}`);
      toast.success("Deleted successfully");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans text-black">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/50">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-black text-slate-900">User Management</h1>
              <p className="text-slate-500 text-sm">Main Control for Super Admin</p>
            </header>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
              <div className="space-y-4 pb-20">
                {subAdmins.map((admin: any) => (
                  <div key={admin.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                    {/* Admin Header */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <img src={admin.profilePic} className="w-12 h-12 rounded-full border" alt="" />
                        <div>
                          <h3 className="font-bold text-slate-900">{admin.name}</h3>
                          <p className="text-xs text-slate-500 italic">Sub-Admin</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setExpandedAdmin(expandedAdmin === admin.id ? null : admin.id)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1"
                        >
                          {teachers.filter(t => t.userId === admin.id).length} Teachers
                          {expandedAdmin === admin.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </button>
                        <button onClick={() => openEditModal(admin, 'users')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18}/></button>
                        <button onClick={() => confirmDelete(admin.id, 'users')} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>

                    {/* Teacher List */}
                    {expandedAdmin === admin.id && (
                      <div className="bg-slate-50/50 p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teachers.filter(t => t.userId === admin.id).map((teacher: any) => (
                          <div key={teacher.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-3">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg h-fit"><GraduationCap size={20}/></div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{teacher.name}</p>
                                  <p className="text-[10px] text-slate-500">{teacher.institute}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openEditModal(teacher, 'teachers')} className="p-1.5 text-slate-300 hover:text-blue-500"><Edit size={14}/></button>
                                <button onClick={() => confirmDelete(teacher.id, 'teachers')} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                              </div>
                            </div>
                            {/* Teacher Tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {teacher.classes?.map((c:string) => <span key={c} className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{c}</span>)}
                              {teacher.subjects?.map((s:string) => <span key={s} className="text-[9px] bg-green-50 px-2 py-0.5 rounded text-green-700 font-bold">{s}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODERN EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-xl text-slate-900">Edit Details</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Name</label>
                <input type="text" className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" value={editingItem?.name || ''} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Email</label>
                <input type="email" className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" value={editingItem?.email || ''} onChange={(e) => setEditingItem({...editingItem, email: e.target.value})} />
              </div>

              {editType === 'teachers' && (
                <>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Institute</label>
                    <input type="text" className="w-full p-2 border rounded-lg outline-none" value={editingItem?.institute || ''} onChange={(e) => setEditingItem({...editingItem, institute: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Classes (Separated by comma)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-lg outline-none" 
                      placeholder="9th, 10th, 11th"
                      value={editingItem?.classes?.join(', ') || ''} 
                      onChange={(e) => setEditingItem({...editingItem, classes: e.target.value.split(',').map(s => s.trim())})} 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Subjects (Separated by comma)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-lg outline-none" 
                      placeholder="Math, Physics"
                      value={editingItem?.subjects?.join(', ') || ''} 
                      onChange={(e) => setEditingItem({...editingItem, subjects: e.target.value.split(',').map(s => s.trim())})} 
                    />
                  </div>
                </>
              )}

              <div className="col-span-2 pt-4 flex gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Update Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
            <p className="text-slate-500 text-sm mb-8">This action cannot be undone. All data related to this user will be removed from the system.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">No, Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}