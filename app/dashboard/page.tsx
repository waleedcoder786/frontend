'use client';
import React, { use, useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaFileAlt, 
  FaSave, 
  FaHistory, 
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaArrowRight,
  FaPlus
} from "react-icons/fa";
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();

  const [savedPapers, setSavedPapers] = useState([]);

   useEffect(() => {

      }, []);
  useEffect(() => { 

              const storedUser = localStorage.getItem('user');
          if (storedUser) {
              const userid = JSON.parse(storedUser).id;
              
              const fetchPapers = async () => {
                const res = await axios.get('http://localhost:3001/papers', {
        params: {
          userId: userid
        }
      });
      setSavedPapers(res.data);
      console.log("Fetched Paper:", res.data);
    };
    fetchPapers();
  }

  }, []);

  // Updated stats with specific color palettes for the new design
  const stats = [
    { label: 'Generate Paper', value: '0', color: 'bg-blue-500', lightColor: 'bg-blue-100/50', shadow: 'shadow-blue-200', icon: <FaPlus />, path: '/generate-paper' },
    { label: 'Saved Papers', value: savedPapers.length, color: 'bg-emerald-500', lightColor: 'bg-emerald-100/50', shadow: 'shadow-emerald-200', icon: <FaSave />, path: '/saved-papers' },
    { label: 'Past Papers', value: 'Punjab Boards', color: 'bg-purple-500', lightColor: 'bg-purple-100/50', shadow: 'shadow-purple-200', icon: <FaHistory />, path: '/past-papers' },
    { label: 'Total Teachers', value: '0', color: 'bg-indigo-500', lightColor: 'bg-indigo-100/50', shadow: 'shadow-indigo-200', icon: <FaChalkboardTeacher />, path: '/teachers' },
    { label: 'Paper History', value: '0', color: 'bg-cyan-500', lightColor: 'bg-cyan-100/50', shadow: 'shadow-cyan-200', icon: <FaFileAlt />, path: '/paper-history' },
    { label: 'Login History', value: '0', color: 'bg-slate-700', lightColor: 'bg-slate-200/50', shadow: 'shadow-slate-300', icon: <FaSignOutAlt />, path: '/login-history' },
  ];

  const handleCardClick = (path: string) => {
    router.push(path);
  };


useEffect(() => { 
  const fetchPapers = async () => {
    const res = await axios.get('http://localhost:3001/papers', {
      params: {
        userId: 1769275867374
      }
    });

    console.log("Fetched Paper:", res.data);
  };

  fetchPapers();
}, []);



  return (
    // FIX: Changed w-screen to w-full and added overflow-x-hidden to prevent horizontal scroll
    <div className="h-screen w-full bg-[#f0f4f8] flex overflow-hidden font-sans relative">
      
      {/* Decorative Background Blobs for attractiveness */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <Navbar />

      {/* Main Content Area - min-w-0 ensures flex children don't overflow */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
        <Header />
        
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
           {/* <div className="max-w-7xl mx-auto mb-10">
             <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
             <p className="text-slate-500 font-medium">Welcome back to your control panel.</p>
           </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto pb-10">
            {stats.map((stat, index) => (
              <div 
                key={index}
                onClick={() => handleCardClick(stat.path)}
                className="group relative cursor-pointer"
              >
                {/* THE NEW SHAPE: Asymmetric Rounded Corners 
                   rounded-[top-left_top-right_bottom-right_bottom-left]
                */}
                <div className={`relative z-20 bg-white p-8 h-60 flex flex-col justify-between
                  rounded-[40px_10px_40px_10px]
                  border-[3px] border-transparent ${stat.lightColor}
                  shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]
                  transition-all duration-300 
                  group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]
                  group-hover:border-white
                  overflow-hidden
                `}>
                  
                  {/* Decorative Glow Blob inside the card */}
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${stat.color} opacity-10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>

                  <div className="flex justify-between items-start relative z-10">
                    {/* Floating Icon Bubble */}
                    <div className={`w-16 h-16 ${stat.color} text-white rounded-full flex items-center justify-center shadow-lg shadow-${stat.shadow}/50 text-2xl transform group-hover:rotate-12 transition-transform duration-300`}>
                      {stat.icon}
                    </div>

                    <div className={`flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:${stat.color.replace('bg-', 'text-')} transition-colors`}>
                       Go to section <FaArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"/>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {stat.label}
c                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black text-slate-800 tracking-tighter group-hover:${stat.color.replace('bg-', 'text-')} transition-colors`}>
                        {stat.value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Colored Shadow Layer Behind for depth */}
                <div className={`absolute inset-0 z-10 rounded-[45px_15px_45px_15px] ${stat.color} opacity-20 blur-xl translate-y-4 scale-95 group-hover:translate-y-6 group-hover:scale-100 transition-all duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}