'use client';

import React from 'react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    //  Main wrapper: overflow-x-hidden lagaya taaki left/right scroll na aaye
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center md:p-8 font-sans overflow-x-hidden">
      
      {/*  Container: Mobile par height auto rakhi hai taaki content na kate */}
      <div className="w-full max-w-6xl bg-white md:rounded-2xl shadow-2xl flex flex-col min-h-screen md:min-h-[85vh]">

        {/*  Navbar: Mobile par padding adjust ki taaki Login button na kate */}
        <nav className="flex justify-between items-center px-5 py-4 md:px-8 border-b border-gray-100">
          <div className="font-black text-xl text-blue-600 tracking-tighter">CTM.</div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button
              className="text-gray-600 hover:text-black font-semibold text-sm md:text-base transition-colors"
              onClick={() => router.push('/auth/login')}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="bg-blue-600 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm md:text-base"
            >
              Signup
            </button>
          </div>
        </nav>

        {/*  Content Section: Mobile par flex-col (upar niche), Desktop par flex-row (aamne samne) */}
        <div className="flex flex-col md:flex-row flex-1">

          {/*  Left Side (Text & Buttons) */}
          <div className="flex-1 px-6 py-10 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Creative <br className="hidden md:block" /> Test Maker
            </h1>
            <p className="text-gray-500 max-w-sm mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
              Where ideas transform into insights. Built for educators and creators across Pakistan.
            </p>

            {/* Buttons: Mobile par 100% width (w-full) aur aamne-samne ki jagah upar-niche */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 w-full sm:w-auto">
              <button
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-blue-200/50 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center"
                onClick={() => router.push('/auth/signup')}
              >
                Start Creating
              </button>

              <button
                className="w-full sm:w-auto border-[2px] border-blue-100 text-blue-600 bg-blue-50/50 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-100 hover:border-blue-200 active:scale-95 transition-all flex justify-center items-center"
                onClick={() =>
                  window.open('https://www.youtube.com/watch?v=uXJEuA0eX8A', '_blank')
                }
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/*  Right Side (Interactive Area) */}
          <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 min-h-[350px] md:min-h-full border-t md:border-t-0 md:border-l border-gray-100">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <div className="absolute w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
              <div className="absolute w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30 -bottom-10 -right-10"></div>
              
              <div className="relative z-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center animate-bounce duration-[3000ms]">
                <span className="block text-4xl mb-2">📊</span>
                <p className="text-gray-400 font-medium text-sm">Interactive Analytics Area</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-[11px] font-medium text-gray-400 bg-white">
          © 2026 Creative Developers Pakistan • Secure & Private
        </footer>

      </div>
    </div>
  );
}