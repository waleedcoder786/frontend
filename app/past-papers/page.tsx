import React from 'react'
import Navbar from '../components/navbar/page';
import Header from '../components/topbar/page';

function page() {
  return (
    <>
    <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      

    <Navbar/>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        
        <div className="flex-1 p-10 overflow-y-auto bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="max-w-3xl text-center">
            <h2 className="text-3xl font-black text-slate-900 leading-none mb-4">No Past Papers</h2>
            <p className="text-slate-500 mb-8">Here are all your saved test papers. You can view, edit, or delete them as needed.</p>   
            </div>
        </div>
    </main>

    </div>
    


    </>
  )
}

export default page