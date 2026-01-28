'use client';

import React from 'react';
import { useRouter } from "next/navigation";

export default function CreativeTestMaker() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">

        {/* Navbar */}
        <nav className="flex justify-end items-center gap-6 p-4 md:p-6 border-b">
          <button
            className="text-gray-600 hover:text-black font-medium"
            onClick={() => router.push('/auth/login')}
          >
            Login
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-600"
          >
            Signup
          </button>
        </nav>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1">

          {/* Left */}
          <div className="flex-1 p-10 flex flex-col justify-center space-y-6">
            <h1 className="text-5xl font-extrabold">
              Creative <br /> Test Maker
            </h1>
            <p className="text-gray-500 max-w-sm">
              Where ideas transform into insights.
            </p>

            <div className="flex gap-3">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold"
                onClick={() => router.push('/auth/signup')}
              >
                Start Creating
              </button>

              <button
                className="border-2 border-blue-400 text-blue-600 px-6 py-3 rounded-xl font-bold"
                onClick={() =>
                  window.open('https://www.youtube.com/watch?v=uXJEuA0eX8A', '_blank')
                }
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">Interactive cards area</p>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-xs text-gray-400 border-t">
          © 2026 Creative Developers Pakistan
        </footer>

      </div>
    </div>
  );
}
