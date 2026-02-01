"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation"; // 👈 Yeh line add karein

function Page() {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: "",
    password: "",
    role: "",
  });
  const pathname = usePathname().split("/").pop()?.replace(/-/g, " ");

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- Load Data on Mount ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

//   console.log(user.role);
  

  // --- Logic: Handle Profile Update ---
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Password Verification (Bcrypt comparison)
      const isMatch = bcrypt.compareSync(passwords.oldPassword, user.password);

      if (!isMatch) {
        toast.error("Incorrect current password!");
        setIsLoading(false);
        return;
      }

      // 2. Validate New Password if user is trying to change it
      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          toast.error("New passwords do not match!");
          setIsLoading(false);
          return;
        }
      }

      // 3. Fetch User ID from DB using email
      const searchRes = await axios.get(
        `http://localhost:3001/users?email=${user.email}`,
      );

      if (searchRes.data.length > 0) {
        const dbUser = searchRes.data[0];
        const userId = dbUser.id;

        // 4. Prepare Updated Object
        let finalPassword = user.password; // Default to old hash

        if (passwords.newPassword) {
          // Hash the new password before sending to DB
          const salt = bcrypt.genSaltSync(10);
          finalPassword = bcrypt.hashSync(passwords.newPassword, salt);
        }

        const updatedData = {
          ...user,
          password: finalPassword,
          name: user.name,
          profilePic: user.profilePic,
        };

        // 5. Update Database
        const response = await axios.put(
          `http://localhost:3001/users/${userId}`,
          updatedData,
        );

        if (response.status === 200) {
          // 6. Sync LocalStorage and Component State
          localStorage.setItem("user", JSON.stringify(updatedData));
          setUser(updatedData);

          // Reset fields and close modal
          setPasswords({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setIsModalOpen(false);
          toast.success("Profile updated successfully!");
        }
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Connection error: Make sure your server is running on port 3001.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-24 bg-slate-50">
      {/* Header Section */}
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-800 tracking-tight capitalize">
            {pathname} Overview
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Live System Update • 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none capitalize">
              {user.name || "User"}
            </p>
            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">{ user.role === "teacher" ? " Plan: Standard" : 
              "Plan: Premium Member"}
            </p>
          </div>
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-xl overflow-hidden ring-4 ring-slate-50 transition-transform hover:scale-105 cursor-pointer"
          >
            {user.profilePic ? (
              <img
                className="w-full h-full object-cover"
                src={user.profilePic}
                alt="User"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-xl uppercase">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Section */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !isLoading && setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            {" "}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-black text-slate-800">
                Edit Profile
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Profile Pic Upload */}
              <div className="flex flex-col items-center py-1">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner mb-2">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300 font-bold uppercase">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Paste Image URL here..."
                  className="text-[11px] w-full p-1 bg-slate-50 text-gray-700 border border-slate-200 rounded-md outline-none focus:border-blue-400"
                  value={user.profilePic}
                  onChange={(e) =>
                    setUser({ ...user, profilePic: e.target.value })
                  }
                />
              </div>

              {/* Info Fields */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full p-1.5 border text-[14px] border-slate-200 rounded-md focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-500 transition-all mt-1 text-slate-600"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full p-1.5 bg-slate-50 text-[14px] border border-slate-200 rounded-md text-slate-400 cursor-not-allowed mt-1"
                />
              </div>

              {/* Password Section */}
              {/* <div className="space-y-1 pt-2 border-t border-slate-100"> */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Verify Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                  className="w-full p-1.5 border border-slate-200 text-[13px] rounded-md outline-none focus:border-blue-500 mt-1 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="New password "
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-1.5 border text-[13px] border-slate-200 rounded-md outline-none focus:border-blue-500 mt-1 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                    Confirm New
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full p-1.5 border text-[14px] border-slate-200 rounded-md outline-none focus:border-blue-500 mt-1 text-slate-700"
                  />
                </div>
              </div>
              {/* </div> */}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-bold py-4 rounded-md shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4 flex justify-center items-center`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
