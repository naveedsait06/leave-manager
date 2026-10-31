import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, UserCheck, LogOut } from 'lucide-react';

export default function Topbar({ user, pendingLeaveRequests, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fallback display name or extraction from email if name is missing
  const displayName = user.name || user.email.split('@')[0];

  return (
    <header className="bg-white/[0.02] backdrop-blur-3xl border-b border-white/10 px-8 py-4 flex justify-between items-center relative z-40 shadow-sm">
      <div className="flex items-center space-x-3 md:hidden">
        <span className="font-extrabold text-sm tracking-widest text-white">RIGEL HRMS</span>
      </div>
      <div className="hidden md:block">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Welcome back,</p>
        <p className="text-sm font-bold text-white tracking-wide">{displayName}</p>
      </div>

      <div className="flex items-center space-x-6">
        
        {/* Notification Bell (Manager Only) */}
        {user.role === 'manager' ? (
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative text-white/70 hover:text-white transition cursor-pointer p-2.5 rounded-2xl hover:bg-white/[0.05] border border-white/10"
            >
              <Bell className="w-4 h-4" />
              {pendingLeaveRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#090d16] border border-white/15 rounded-3xl shadow-2xl py-3 z-50 text-xs">
                <div className="px-4 pb-3 border-b border-white/10 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-[0.15em] text-white/85">Leave Notifications</span>
                  <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    {pendingLeaveRequests.length} Pending
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {pendingLeaveRequests.length === 0 ? (
                    <p className="text-center py-6 text-white/40">No new leave notifications</p>
                  ) : (
                    pendingLeaveRequests.map((req) => (
                      <div 
                        key={req._id} 
                        onClick={() => { navigate('/manager-leaves'); setNotificationsOpen(false); }}
                        className="p-3.5 hover:bg-white/[0.04] transition cursor-pointer space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white">{req.employee?.name || 'Employee'}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-bold">Pending</span>
                        </div>
                        <p className="text-white/60 text-[11px]">{req.leaveType} ({req.fromDate} to {req.toDate})</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="relative text-white/70 hover:text-white transition cursor-pointer p-2.5 rounded-2xl hover:bg-white/[0.05] border border-white/10">
            <Bell className="w-4 h-4" />
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="relative pl-4 border-l border-white/10" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 hover:bg-white/[0.05] p-2 rounded-2xl transition cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-sky-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                <span>{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </p>
              <p className="text-[10px] text-white/40 font-mono tracking-wider">{user.employeeId || 'EMP0012'}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-[#090d16] border border-white/15 rounded-3xl shadow-2xl py-3 z-50 text-xs">
              <div className="px-4 pb-3 border-b border-white/10 mb-1">
                <p className="font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
              <button 
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/[0.05] flex items-center space-x-2.5 transition cursor-pointer font-semibold"
              >
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>My Profile</span>
              </button>
              <div className="border-t border-white/10 my-1"></div>
              <button 
                onClick={() => { setDropdownOpen(false); onLogout(); }}
                className="w-full text-left px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 transition cursor-pointer font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}