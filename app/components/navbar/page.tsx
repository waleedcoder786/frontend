'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { 
  FaBars, 
  FaChevronLeft, 
  FaHome, 
  FaFileAlt, 
  FaSave, 
  FaHistory, 
  FaCog, 
  FaSignOutAlt 
} from "react-icons/fa";
import toast from 'react-hot-toast';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current route (e.g., '/generatePaper')
 


  const menuItems = [
    { name: 'Dashboard', icon: <FaHome />, path: '/dashboard' },
    { name: 'Generate Paper', icon: <FaFileAlt />, path: '/generate-paper' },
    { name: 'Saved Paper', icon: <FaSave />, path: '/saved-papers' },
    { name: 'Past Papers', icon: <FaHistory />, path: '/past-papers' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  toast.success("Logged out successfully.");
  localStorage.removeItem('user');
  localStorage.removeItem('userName');

  window.location.href = '/auth/login';
};

  return (
    <aside 
      className={` relative bg-slate-900 text-white flex flex-col transition-all duration-500 ease-in-out  border-r border-slate-800 shadow-2xl z-100 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900 text-white shadow-lg hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <FaChevronLeft size={12} /> : <FaBars size={12} />}
      </button>

      {/* Logo Section */}
      <div className={`flex items-center gap-3 p-6 mb-4 h-24 overflow-hidden ${!isOpen && 'justify-center'}`}>
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">C</div>
        {isOpen && <span className="font-black tracking-tight text-xl whitespace-nowrap opacity-100 transition-opacity duration-500">CTM Admin</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          // Check if current item path matches the browser's URL
          const isActive = pathname === item.path;

          return (
            <button 
              key={item.name} 
              onClick={() => handleCardClick(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' // Active Styles
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white' // Inactive Styles
              } ${!isOpen && 'justify-center px-0'}`}
            >
              <span className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              
              {/* Tooltip for Closed State */}
              {!isOpen && (
                <div className="absolute left-16 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl whitespace-nowrap z-50 uppercase tracking-widest border border-slate-700">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-3 mt-auto border-t border-slate-800">
        <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all ${!isOpen && 'justify-center px-0'}`}>
          <FaSignOutAlt className="text-xl" />
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
      
    </aside>
  );
}

export default Sidebar;