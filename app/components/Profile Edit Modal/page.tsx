'use client'; // Next.js use kar rahe hain toh ye zaroori hai

import React, { useState, useEffect } from 'react';

function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState({ name: '', email: '', profilePic: '', password: '' });

    // LocalStorage se data load karne ke liye
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSave = () => {
        // e.preventDefault();
        localStorage.setItem('user', JSON.stringify(user));
        setIsModalOpen(false);
        alert("Profile Updated Successfully!");
    };

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* --- HEADER --- */}
            <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live System Update • 2026</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-800 leading-none capitalize">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">Plan: Premium Member</p>
                    </div>
                    
                    {/* Profile Clickable Area */}
                    <div 
                        onClick={() => setIsModalOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-xl overflow-hidden ring-4 ring-slate-50 transition-transform hover:scale-105 cursor-pointer active:scale-95"
                    >
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-gray-700 font-bold text-2xl">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- EDIT PROFILE POPUP (MODAL) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-800">Edit Profile</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                {/* Profile Pic Upload Placeholder */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 mb-3 overflow-hidden border-2 border-slate-200">
                                        {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">IMG</div>}
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Paste Image URL" 
                                        className="text-xs w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={user.profilePic}
                                        onChange={(e) => setUser({...user, profilePic: e.target.value})}
                                    />
                                </div>

                                {/* Email (Read Only) */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user.email || 'user@example.com'} 
                                        readOnly 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={user.name} 
                                        onChange={(e) => setUser({...user, name: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">New Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••"
                                        onChange={(e) => setUser({...user, password: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 mt-4"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;