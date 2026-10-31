import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export default function ManagerDashboard({ user }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [empRes, leaveRes] = await Promise.all([
        API.get('/users'),
        API.get('/leaves/all')
      ]);
      setEmployees(empRes.data);
      setAllLeaves(leaveRes.data);
    } catch (err) {
      console.error('Failed to load manager dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');
  const todayDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Leadership Suite Hero Banner */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3 z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[11px] font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Leadership Suite — Active</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white font-serif">
            Welcome, {user.name} 🏛️
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-xl leading-relaxed font-light">
            Oversee department personnel, manage staff attendance records, and review time-off approval queues effortlessly.
          </p>
        </div>

        <div className="z-10 bg-white/[0.04] border border-white/10 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50 animate-pulse"></div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/40">Role</p>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Manager / HR</p>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div 
          onClick={() => navigate('/employees')} 
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Team Members</p>
            <span className="p-2.5 bg-white/[0.05] rounded-2xl text-white text-xs">👥</span>
          </div>
          <p className="text-3xl font-light text-white mt-4 tracking-tight font-mono">
            {employees.length} <span className="text-xs font-sans text-white/40">enrolled</span>
          </p>
          <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>View Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/manager-leaves')} 
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Pending Leave Requests</p>
            <span className="p-2.5 bg-white/[0.05] rounded-2xl text-white text-xs">⏳</span>
          </div>
          <p className="text-3xl font-light text-amber-400 mt-4 tracking-tight font-mono">
            {pendingLeaves.length} <span className="text-xs font-sans text-white/40">requests</span>
          </p>
          <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/attendance')} 
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Shift Date</p>
            <span className="p-2.5 bg-white/[0.05] rounded-2xl text-white text-xs">📅</span>
          </div>
          <p className="text-2xl font-light text-white mt-4 tracking-tight font-serif">
            {todayDateString}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Manage Attendance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Recent Pending Leave Approvals Stream */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-5">
          <div>
            <h2 className="text-xl font-light text-white font-serif">Action Required: Leave Queue</h2>
            <p className="text-white/50 text-xs mt-0.5">Quickly inspect or manage pending requests waiting for your approval.</p>
          </div>
          <button 
            onClick={() => navigate('/manager-leaves')}
            className="text-xs font-bold text-sky-400 hover:underline tracking-wider uppercase cursor-pointer"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/40 text-sm">Loading requests...</div>
        ) : pendingLeaves.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-xs">
            <p>🎉 All caught up! No pending leave requests require your review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.slice(0, 3).map((leave) => (
              <div key={leave._id} className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-white">{leave.employee?.name || 'Staff Member'}</span>
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">{leave.employee?.department || 'Engineering'}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 font-mono">
                    {leave.leaveType} · {leave.fromDate} to {leave.toDate}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/manager-leaves')}
                  className="px-5 py-2.5 bg-white text-black hover:bg-sky-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  Review Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}