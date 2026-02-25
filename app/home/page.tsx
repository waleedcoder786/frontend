'use client';

import React from 'react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    // min-h-screen use kiya taaki mobile pe content katne par scroll ho sake
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-0 md:p-8 font-sans">
      
      {/* Container: Mobile pe full width, Desktop pe max-w-6xl */}
      <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:h-[90vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden border-gray-200 flex flex-col">

        {/* Navbar: Mobile pe justify-center ya space-between */}
        <nav className="flex justify-between md:justify-end items-center gap-4 p-4 md:p-6 border-b">
          <div className="md:hidden font-bold text-blue-600">CTM.</div> {/* Mobile Logo Placeholder */}
          <div className="flex gap-4 md:gap-6">
            <button
              className="text-gray-600 hover:text-black font-medium text-sm md:text-base"
              onClick={() => router.push('/auth/login')}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="bg-blue-500 text-white px-4 md:px-5 py-2 rounded-full font-semibold hover:bg-blue-600 text-sm md:text-base"
            >
              Signup
            </button>
          </div>
        </nav>

        {/* Content Section */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">

          {/* Left Side (Text Content) */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Creative <br className="hidden md:block" /> Test Maker
            </h1>
            <p className="text-gray-500 max-w-sm mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
              Where ideas transform into insights. Built for educators and creators across Pakistan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <button
                className="bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
                onClick={() => router.push('/auth/signup')}
              >
                Start Creating
              </button>

              <button
                className="border-2 border-blue-400 text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 active:scale-95 transition-all"
                onClick={() =>
                  window.open('https://www.youtube.com/watch?v=uXJEuA0eX8A', '_blank')
                }
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Side (Image/Interactive Area) */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-10 min-h-[300px] md:min-h-full">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Decorative background for mobile/desktop */}
              <div className="absolute w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <p className="text-gray-400 font-medium relative z-10 text-center">
                <span className="block text-4xl mb-2">📊</span>
                Interactive Analytics Area
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-[10px] md:text-xs text-gray-400 border-t bg-white">
          © 2026 Creative Developers Pakistan • Secure & Private
        </footer>

      </div>
    </div>
  );
}