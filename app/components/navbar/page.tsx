'use client';
import React, { useState, useEffect } from 'react'; // useEffect add kiya
import { useRouter, usePathname } from 'next/navigation';
import { 
  FaBars, 
  FaChevronLeft, 
  FaHome, 
  FaFileAlt, 
  FaSave, 
  FaHistory, 
  FaCog, 
  FaUsers ,
  FaSignOutAlt,
  FaChalkboardTeacher // Teacher icon add kiya
} from "react-icons/fa";
import toast from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // Role state
  const router = useRouter();
  const pathname = usePathname();

  // Role check karne ke liye
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }
  }, []);

  // Base Menu Items
  const allMenuItems = [
    { name: 'Dashboard', icon: <FaHome />, path: '/dashboard' },
    { name: 'Generate Paper', icon: <FaFileAlt />, path: '/generate-paper' },
    { name: 'Saved Paper', icon: <FaSave />, path: '/saved-papers' },
    { name: 'Teachers', icon: <FaChalkboardTeacher />, path: '/teachers' }, // New
    { name: 'Past Papers', icon: <FaHistory />, path: '/past-papers' },
    { name: 'Users', icon: <FaUsers  />, path: '/users' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
    { name: 'AddData', icon: <PlusCircle />, path: '/add-data' },
  ];

  // ✅ Filter Menu Items based on Role
// ✅ Filter Menu Items based on Role (Super Admin, Sub Admin, Teacher)
  const menuItems = allMenuItems.filter(item => {
    // 1. Agar Role 'teacher' hai
    if (userRole === 'teacher') {
      const teacherRestricted = [ 'Teachers', 'Users', 'Settings','AddData']; 
      return !teacherRestricted.includes(item.name);
    }

        if (userRole === 'superadmin') {
      const teacherRestricted = ['Saved Paper', 'Teachers',  'Settings','Generate Paper','Past Papers'];
      return !teacherRestricted.includes(item.name);
    }

    // 2. Agar Role 'subadmin' hai (Admin table se aane wale users)
    if (userRole === 'admin') {
      return item.name !== 'Users'&& item.name !== 'AddData' && item.name !== 'Settings';
        //  const teacherRestricted = ['Saved Paper', 'Teachers',  'Settings','Generate Paper','Past Papers'];
      // return !teacherRestricted.includes(item.name);
      // Sub-admin ko 'Users' ka page nahi dikhna chahiye (unke liye 'Teachers' hai)
    }

    // 3. Agar Role 'superadmin' hai
    if (userRole === 'superadmin') {
      return true; // Super admin ko sab nazar aayega (including 'Users')
    }

    // Default: Security ke liye jab tak role load na ho, Users hide rakhein
    if (item.name === 'Users') return false;
    
    return true; 
  });
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
      className={`relative bg-slate-900 text-white flex flex-col transition-all  ease-in-out border-r border-slate-800 shadow-2xl z-100 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900 text-white shadow-lg hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <FaChevronLeft size={12} /> : <FaBars size={12} />}
      </button>

      <div className={`flex items-center gap-3 p-6 mb-4 h-24 overflow-hidden ${!isOpen && 'justify-center'}`}>
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">C</div>
        {isOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-black tracking-tight text-xl whitespace-nowrap opacity-100 transition-opacity duration-500">
              {userRole === 'teacher' ? 'CTM Teacher' : 'CTM Admin'}
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-1">
              {userRole || 'User'}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button 
              key={item.name} 
              onClick={() => handleCardClick(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white' 
              } ${!isOpen && 'justify-center px-0'}`}
            >
              <span className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              
              {!isOpen && (
                <div className="absolute left-16 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl whitespace-nowrap z-50 uppercase tracking-widest border border-slate-700">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

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