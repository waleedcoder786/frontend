'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import toast from 'react-hot-toast'; // Import toast

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. JSON Server se user ko email ke zariye dhoondein
      const response = await axios.get(`http://localhost:3001/users?email=${email}`);
      const users = response.data;

      if (users.length > 0) {
        const user = users[0];

        // 2. Bcrypt ke zariye password verify karein
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          // 3. Token Generate karein (User info ko encode karke)
          const tokenData = { id: user.id, email: user.email, name: user.username };
          const token = btoa(JSON.stringify(tokenData));

          // 4. COOKIE SET KAREIN (Ye middleware ke liye zaroori hai)
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;

          console.log(user.username);
          
          // Optional: UI ke liye local storage bhi use kar sakte hain
          localStorage.setItem('user', JSON.stringify({ id: user.id, name: user.username,email: user.email,password: user.password,am:"waleeeeeeeeeeeeeed" }));
  
          toast.success("Login Successful! Welcome " + user.username);
          
          // 5. Dashboard par bhej dein
          router.push('/dashboard'); 
          // Refresh zaroori ho sakta hai agar middleware foran detect na kare
          router.refresh(); 
        } else {
          toast.error("Invalid Password!");
        }
      } else {
          toast.error("User not found with this email!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Server error. Make sure json-server is running on port 3001.");
    } finally {
      setLoading(false);
    }
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

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="remember" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <label htmlFor="remember" className="text-[11px] text-gray-500">
                  Remember me for 30 days
                </label>
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