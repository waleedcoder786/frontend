'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Pehle "users" (Admins) table mein check karein
      const userRes = await axios.get(`http://localhost:3001/users?email=${email}`);
      const users = userRes.data;

      if (users.length > 0) {
        const user = users[0];
        // Bcrypt check for users (Admin)
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          loginSuccess(user, 'admin');
          return;
        }
      }

      // 2. Agar admin nahi mila, to "teachers" table mein check karein
      const teacherRes = await axios.get(`http://localhost:3001/teachers?email=${email}`);
      const teachers = teacherRes.data;

      if (teachers.length > 0) {
        const teacher = teachers[0];
        
        // Teachers table mein password plain text hai (e.g., 12345)
        if (teacher.password === password) {
          loginSuccess(teacher, 'teacher');
          return;
        }
      }

      // Agar dono mein nahi mila
      toast.error("Invalid Email or Password!");

    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Server error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function for successful login
  const loginSuccess = (userData: any, role: string) => {
    // 1. Token Data create karein (Token mein role lazmi shamil karein)
    const tokenData = { 
      id: userData.id, 
      email: userData.email, 
      name: userData.name || userData.username,
      role: role 
    };
    const token = btoa(JSON.stringify(tokenData));

    // 2. Cookies Set Karein (Middleware ke liye)
    // auth_token: security ke liye
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    // user_role: asan redirection control ke liye
    document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;

    // 3. LocalStorage mein data save karein (Frontend UI ke liye)
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      name: userData.name || userData.username,
      email: userData.email,
      role: role,
      classes: userData.classes || [], // Teacher assigned classes
      subjects: userData.subjects || [] // Teacher assigned subjects
    }));

    toast.success(`Welcome ${userData.name || userData.username}!`);
    
    // 4. Redirect to Dashboard
    router.push('/dashboard');
    
    // 5. Refresh taake middleware foran nayi cookies detect kare
    setTimeout(() => {
        router.refresh();
    }, 100);
  };

  return (
    <div className="h-screen w-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden text-black">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] p-10 flex-col justify-between text-white relative">
          <div className="z-10">
            <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              Creative Test Maker.
            </Link>
            <div className="mt-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                Welcome back, <br /> Educator.
              </h2>
              <p className="text-blue-100 text-sm lg:text-base max-w-xs">
                Pick up right where you left off and continue creating impactful assessments.
              </p>
            </div>
          </div>
          <footer className="z-10 text-[10px] text-blue-200 uppercase tracking-widest">
            © 2026 Creative Developers Pakistan
          </footer>
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Log In</h1>
              <p className="text-gray-500 text-sm mt-1">Enter your details to access your tests.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@work.com" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-blue-600 font-medium hover:underline">
                    Forget?
                  </Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50 text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold text-base hover:bg-blue-600 transition-all shadow-md mt-2 disabled:bg-gray-400"
              >
                {loading ? "Verifying..." : "Log in"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Don't have an account? {' '}
                <Link href="/auth/signup" className="text-blue-600 font-bold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}