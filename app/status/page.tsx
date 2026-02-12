"use client";
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Dummy Data: Backend se aap isay fetch karenge
const data = [
  { month: 'Jan', total: 40 },
  { month: 'Feb', total: 150 },
  { month: 'Mar', total: 200 },
  { month: 'Apr', total: 450 },
  { month: 'May', total: 800 },
  { month: 'Jun', total: 1200 },
];

const AdminStatsGraph = () => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">User Growth</h2>
        <p className="text-slate-500 text-sm">Total registered users over time</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 12}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94A3B8', fontSize: 12}}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminStatsGraph;