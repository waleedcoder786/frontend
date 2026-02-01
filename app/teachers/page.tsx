"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import {
  HiOutlineUserAdd,
  HiOutlineX,
  HiCheck,
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlineInbox,
  HiOutlineLockClosed
} from 'react-icons/hi';
import axios from 'axios';

function Page() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef<HTMLDivElement>(null); // Menu ko track karne ke liye
  
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    institute: '',
    password: '',
    confirmPassword: ''
  });

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const classesList = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"];
  const subjectsList = ["Physics","Chemistry","Math","Computer","English","Urdu","Islamiat","Stats"];

  // 🖱️ Click anywhere to close menu logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.id) fetchTeachers(user.id);
    }
  }, []);

  const fetchTeachers = async (userId: string) => {
    try {
      const res = await axios.get(`http://localhost:3001/teachers?userId=${userId}`);
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (item: string) => {
    setSelectedClasses(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleSubject = (item: string) => {
    setSelectedSubjects(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleEditClick = (teacher: any) => {
    setEditingTeacherId(teacher.id);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      city: teacher.city,
      institute: teacher.institute,
      password: '', // Security ke liye khali
      confirmPassword: ''
    });
    setSelectedClasses(teacher.classes || []);
    setSelectedSubjects(teacher.subjects || []);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const { confirmPassword, ...dataToSave } = formData; // confirmPassword api mein nahi bhejni

    const payload = {
      ...dataToSave,
      classes: selectedClasses,
      subjects: selectedSubjects,
      userId: user?.id,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingTeacherId) {
        const res = await axios.put(`http://localhost:3001/teachers/${editingTeacherId}`, payload);
        setTeachers(prev => prev.map(t => t.id === editingTeacherId ? res.data : t));
      } else {
        const res = await axios.post("http://localhost:3001/teachers", { ...payload, createdAt: new Date().toISOString() });
        setTeachers(prev => [...prev, res.data]);
      }
      closeForm();
    } catch {
      alert("Error saving teacher");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTeacherId(null);
    setFormData({ name:'', email:'', phone:'', city:'', institute:'', password:'', confirmPassword:'' });
    setSelectedClasses([]);
    setSelectedSubjects([]);
  };

  const confirmDelete = (teacher: any) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await axios.delete(`http://localhost:3001/teachers/${teacherToDelete.id}`);
      setTeachers(prev => prev.filter(t => t.id !== teacherToDelete.id));
      setShowDeleteModal(false);
    } catch {
      alert("Error deleting");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Teachers Faculty</h2>
                <p className="text-slate-500 text-sm">Manage your academic staff records</p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
              >
                <HiOutlineUserAdd /> Add Teacher
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 animate-pulse text-slate-400">Loading data...</div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                 <HiOutlineInbox className="text-5xl text-slate-200 mb-2" />
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Teachers Found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4 text-left font-bold">Name & Institute</th>
                      <th className="px-6 py-4 text-left font-bold">Contact</th>
                      <th className="px-6 py-4 text-left font-bold">Classes</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm">
                          <div className="font-bold text-slate-800">{t.name}</div>
                          <div className="text-xs text-slate-400">{t.institute}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.email}</td>
                        <td className="px-6 py-4">
                           <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {t.classes?.map((c: string) => (
                              <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{c}</span>
                            ))}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button
                            onClick={(e) => {
                                e.stopPropagation(); // Click listener ko table row par trigger hone se rokta hai
                                setOpenMenuId(openMenuId === t.id ? null : t.id);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                          >
                            <HiOutlineDotsVertical />
                          </button>

                          {openMenuId === t.id && (
                            <div 
                              ref={menuRef}
                              className="absolute right-6 mt-2 w-40 bg-white border border-slate-100 shadow-2xl rounded-xl z-50 py-1"
                            >
                              <button 
                                onClick={() => handleEditClick(t)}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-slate-50 text-slate-700"
                              >
                                <HiOutlinePencil className="text-blue-500" /> Edit Teacher
                              </button>
                              <button
                                onClick={() => confirmDelete(t)}
                                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50"
                              >
                                <HiOutlineTrash /> Delete Teacher
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL: ADD / EDIT FORM --- */}
      {isFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
                            <h3 className="text-xl font-black">{editingTeacherId ? 'Edit Teacher' : 'Register Teacher'}</h3>
                            <button onClick={closeForm} className="w-8 h-8 flex justify-center items-center bg-white/10 hover:bg-red-500 rounded-full transition-all"><HiOutlineX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                                <input required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} type="email" placeholder="Email Address" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} type="tel" placeholder="Phone" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                                </div>
                                <div className="relative">
                                    <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} type="text" placeholder="City" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                                </div>
                            </div>
                            
                            {/* 🔑 Password Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input required={!editingTeacherId} value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})} type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                                </div>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input required={!editingTeacherId} value={formData.confirmPassword} onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} type="password" placeholder="Confirm Password" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />
                                </div>
                            </div>
                            <input value={formData.institute} onChange={(e)=>setFormData({...formData, institute: e.target.value})} type="text" placeholder="Institute Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-md outline-none text-sm  text-slate-700" />


                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assign Classes</label>
                                <div className="flex flex-wrap gap-2">
                                    {classesList.map(cls => (
                                        <button key={cls} type="button" onClick={() => toggleClass(cls)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${selectedClasses.includes(cls) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{cls}</button>
                                    ))}
                                </div>
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block pt-2">Assign Subjects</label>
                                <div className="flex flex-wrap gap-2">
                                    {subjectsList.map(sub => (
                                        <button key={sub} type="button" onClick={() => toggleSubject(sub)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all flex items-center gap-1 ${selectedSubjects.includes(sub) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-100 text-slate-500"}`}>{selectedSubjects.includes(sub) && <HiCheck />} {sub}</button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest mt-4 hover:bg-slate-800 transition-colors">Save Teacher Profile</button>
                        </form>
                    </div>
                </div>
            )}

      {/* --- MODAL: DELETE CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 w-[90%] max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineTrash size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Are you sure?</h2>
            <p className="text-slate-500 mt-2">
              You are about to delete <span className="font-bold text-slate-800">{teacherToDelete?.name}</span>. This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;