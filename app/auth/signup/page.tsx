'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs'; // 1. Import bcryptjs
import toast from 'react-hot-toast'; // Import toast

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 2. Hash the password before sending
      // Salt rounds (10) define how secure the hash is
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);

      // 3. Send data with hashed password
      const response = await axios.post('https://respectable-fionnula-personaluseprojects-818b9efd.koyeb.app/api/users', {
        username: formData.username,
        email: formData.email,
        password: hashedPassword,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });

      if (response.status === 201) {
           toast.success("Account Created Successfully! Please logIn.");
        router.push('/auth/login');
      }
    } catch (error) {
      toast.error("Error creating account.");
    }
  };
  return (
    <div className="h-screen w-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row">
        
        {/* Left Side (Branding) remains the same ... */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] p-10 flex-col justify-between text-white relative">
          <div className="z-10">
            <Link href="/" className="text-xl font-bold tracking-tight">Creative Test Maker.</Link>
            <div className="mt-16 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">Join 5,000+ <br /> Educators today.</h2>
            </div>
          </div>
          <footer className="z-10 text-[10px] text-blue-200 uppercase tracking-widest">© 2026 Creative Developers Pakistan</footer>
        </div>

        {/* Right Side: Signup Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Create Account</h1>
              <p className="text-gray-500 text-sm mt-1">Start making tests in minutes.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Full Name</label>
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text" 
                  required
                  placeholder="John Doe" 
                  className="w-full px-4 py-2.5 rounded-xl border text-black border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  required
                  placeholder="name@work.com" 
                  className="w-full px-4 py-2.5 rounded-xl text-black border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full px-4 py-2.5 rounded-xl text-black border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="terms" required className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <label htmlFor="terms" className="text-[11px] text-gray-500">
                  I agree to the <span className="text-blue-600 font-medium cursor-pointer">Terms of Service</span>
                </label>
              </div>

              <button type="submit" className="w-full bg-[#3b82f6] text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-600 transition-all shadow-md mt-2">
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Already have an account? {' '}
                <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
