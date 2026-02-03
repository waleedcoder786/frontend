"use client"
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  PlusCircle, 
  LogOut, 
  UserShield,
  Menu,
  Bell
} from 'lucide-react'; // icons کے لیے 'npm install lucide-react' کریں

const WhiteAdminPanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Form State
  const [type, setType] = useState("mcq"); 
  const [formData, setFormData] = useState({
    category: "exercise",
    question: "",
    options: { A: "", B: "", C: "", D: "" },
    answer: "", // Shorts/Longs کے لیے
    marks: "1"
  });

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === "admin@example.com") {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "questions_v2"), {
        ...formData,
        type,
        createdAt: new Date()
      });
      alert("Success! Question added to database.");
      setFormData({ ...formData, question: "", answer: "" }); // Reset
    } catch (err) {
      alert("Error saving data!");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl border">
          <UserShield size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-gray-800">SuperAdmin Access Only</h1>
          <p className="text-sm mt-2">Please login with authorized credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-700">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">EduPanel</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'mcq', label: 'MCQs Manager', icon: <PlusCircle size={20}/> },
            { id: 'short', label: 'Short Questions', icon: <FileText size={20}/> },
            { id: 'long', label: 'Long Questions', icon: <LayoutDashboard size={20}/> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setType(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${type === item.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500'}`}
            >
              {item.icon}
              {sidebarOpen && <span className="font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg">
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-blue-600"><Bell size={20}/></button>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
              SA
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8 max-w-5xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-capitalize">Create New {type}</h2>
            <p className="text-slate-500">Add questions to your digital library</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <form onSubmit={handleSave} className="p-8 space-y-8">
              
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Resource Origin</label>
                  <select 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="exercise">Exercise Content</option>
                    <option value="additional">Additional Material</option>
                    <option value="past_paper">Past Paper Archive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Assigned Marks</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFormData({...formData, marks: e.target.value})}
                  />
                </div>
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Question Text</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-sm"
                  placeholder="What is the capital of..."
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                ></textarea>
              </div>

              {/* Dynamic Inputs */}
              {type === 'mcq' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="relative">
                      <span className="absolute left-4 top-3.5 font-bold text-blue-400">{opt}</span>
                      <input 
                        type="text" 
                        placeholder={`Option ${opt}`}
                        className="w-full bg-white border border-slate-200 p-3 pl-10 rounded-xl outline-none focus:border-blue-500 transition-colors"
                        onChange={(e) => setFormData({
                          ...formData, 
                          options: {...formData.options, [opt]: e.target.value}
                        })}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Reference Answer</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                    rows="6"
                    placeholder="Provide the correct solution or keywords..."
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  ></textarea>
                </div>
              )}

              <div className="pt-4">
                <button 
                  disabled={loading}
                  type="submit"
                  className="px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {loading ? "Processing..." : "Publish to Database"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhiteAdminPanel;