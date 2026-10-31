import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, UserCheck, Clock, Calendar, Users, LogOut } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const BrandLogo = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="15,10 50,45 35,60 0,25" fill="#38bdf8" />
      <polygon points="30,30 65,65 50,80 15,45" fill="#0284c7" />
      <polygon points="45,50 80,85 65,100 30,65" fill="#0369a1" />
      <polygon points="55,70 75,90 60,105 40,85" fill="#0b2341" />
    </svg>
  );

  return (
    <aside className="w-64 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 flex flex-col justify-between hidden md:flex z-20">
      <div>
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-sky-500/20">
            <BrandLogo className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-widest text-white">RIGEL</h1>
            <p className="text-[9px] text-white/40 tracking-[0.25em] font-bold">SOFTWARE SOLUTIONS</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 text-xs font-semibold tracking-wider uppercase">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
              location.pathname === '/dashboard' || location.pathname === '/' 
                ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
              location.pathname === '/profile' 
                ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => navigate('/attendance')}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
              location.pathname === '/attendance' 
                ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{user.role === 'manager' ? 'Manage Attendance' : 'Attendance'}</span>
          </button>

          {/* Hidden for managers - Only visible to employees */}
          {user.role !== 'manager' && (
            <button
              onClick={() => navigate('/leave')}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
                location.pathname === '/leave' 
                  ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Leave</span>
            </button>
          )}

          {user.role === 'manager' && (
            <>
              <button
                onClick={() => navigate('/employees')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
                  location.pathname === '/employees' 
                    ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team Directory</span>
              </button>

              <button
                onClick={() => navigate('/manager-leaves')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition cursor-pointer ${
                  location.pathname === '/manager-leaves' 
                    ? 'bg-white text-black font-extrabold shadow-xl shadow-white/5' 
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Leave Approvals</span>
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-rose-400 hover:bg-rose-500/10 rounded-2xl font-bold transition text-xs uppercase tracking-wider cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}