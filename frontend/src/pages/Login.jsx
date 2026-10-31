import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode] = useState('selector'); // 'selector' or 'auth'
  const [selectedRole, setSelectedRole] = useState('employee'); // 'employee' or 'manager'
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Whisper-smooth luxury transition timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleCardSelect = (role) => {
    setSelectedRole(role);
    setViewMode('auth');
    setIsRegister(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await API.post('/auth/register', { name, email, password, role: selectedRole, department });
        const response = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      } else {
        const response = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Exact Logo Vector Component
  const BrandLogo = ({ className = "w-7 h-7" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="15,10 50,45 35,60 0,25" fill="#38bdf8" />
      <polygon points="30,30 65,65 50,80 15,45" fill="#0284c7" />
      <polygon points="45,50 80,85 65,100 30,65" fill="#0369a1" />
      <polygon points="55,70 75,90 60,105 40,85" fill="#0b2341" />
    </svg>
  );

  // --- MINIMALIST LUXURY INTRO ANIMATION ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#030508] flex items-center justify-center z-50 select-none overflow-hidden transition-all duration-1000">
        <div className="text-center space-y-4 animate-[fadeIn_0.9s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center justify-center mb-4 opacity-95">
            <BrandLogo className="w-12 h-12" />
          </div>
          <h1 className="text-xs font-semibold tracking-[0.5em] text-white/90 uppercase font-sans">
            RIGEL SOFTWARE SOLUTIONS
          </h1>
          <div className="w-16 h-[1px] bg-sky-400/60 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- VIEW 1: DUAL-CARD SPLIT SELECTOR ---
  if (viewMode === 'selector') {
    return (
      <div className="min-h-screen w-screen bg-[#030508] flex flex-col lg:flex-row overflow-hidden font-sans text-white select-none transition-all duration-700 ease-in-out">
        
        {/* Minimalist Header Branding */}
        <div className="absolute top-8 left-10 z-30 hidden lg:flex items-center space-x-3.5 pointer-events-none">
          <BrandLogo className="w-6 h-6" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/90">RIGEL SOFTWARE SOLUTIONS</span>
        </div>

        {/* Left Card: Employee */}
        <div 
          onClick={() => handleCardSelect('employee')}
          className="group relative flex-1 h-[50vh] lg:h-screen flex flex-col justify-end p-10 lg:p-20 cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-[#030508]/50 to-transparent"></div>

          <div className="relative z-10 space-y-4 transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-sky-400">
              WORKSPACE PORTAL
            </span>
            <h2 className="text-4xl xl:text-6xl font-light tracking-tight text-white font-serif">
              I am an Employee
            </h2>
            <p className="text-white/60 text-xs xl:text-sm font-light max-w-sm tracking-wide leading-relaxed">
              Log daily attendance timestamps, review active shift hours, and manage time-off applications seamlessly.
            </p>
            <div className="pt-3 flex items-center space-x-3 text-xs font-semibold tracking-widest text-white uppercase group-hover:text-sky-400 transition-colors duration-300">
              <span>Access Workspace</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300 ease-out" />
            </div>
          </div>
        </div>

        {/* Right Card: Manager */}
        <div 
          onClick={() => handleCardSelect('manager')}
          className="group relative flex-1 h-[50vh] lg:h-screen flex flex-col justify-end p-10 lg:p-20 cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-[#030508]/50 to-transparent"></div>

          <div className="relative z-10 space-y-4 transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-400">
              LEADERSHIP SUITE
            </span>
            <h2 className="text-4xl xl:text-6xl font-light tracking-tight text-white font-serif">
              I am a Manager
            </h2>
            <p className="text-white/60 text-xs xl:text-sm font-light max-w-sm tracking-wide leading-relaxed">
              Inspect team attendance records, review leave approval queues, and oversee organizational productivity.
            </p>
            <div className="pt-3 flex items-center space-x-3 text-xs font-semibold tracking-widest text-white uppercase group-hover:text-indigo-400 transition-colors duration-300">
              <span>Access Dashboard</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300 ease-out" />
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --- VIEW 2: ULTRA-LUXURY OBSIDIAN GLASSMORPHISM AUTH SCREEN ---
  return (
    <div className="min-h-screen w-screen bg-[#030508] flex items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden select-none">
      
      {/* Background Cinematic Mesh Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[180px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[180px] pointer-events-none animate-pulse"></div>

      {/* Luxury Split Glass Container */}
      <div className="w-full max-w-5xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Interactive Glass Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between relative bg-white/[0.02]">
          
          <div>
            <button 
              onClick={() => setViewMode('selector')}
              className="text-white/50 hover:text-white flex items-center space-x-1.5 text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="space-y-2">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-sky-400 uppercase tracking-[0.25em]">
                <BrandLogo className="w-4 h-4" />
                <span>Rigel Software Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight font-serif">
                Hi there.
              </h2>
              <p className="text-white/40 text-xs font-semibold tracking-wide">
                Accessing portal as <strong className="text-white uppercase tracking-wider">{selectedRole}</strong>
              </p>
            </div>
          </div>

          {error && (
            <div className="my-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl flex items-center space-x-2 font-medium">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4 my-6 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="block text-white/50 font-bold uppercase tracking-[0.15em] text-[10px] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] font-medium shadow-inner transition duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/50 font-bold uppercase tracking-[0.15em] text-[10px] mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] font-medium shadow-inner transition duration-300"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-white/50 font-bold uppercase tracking-[0.15em] text-[10px] mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] font-medium shadow-inner transition duration-300"
              />
            </div>

            <div>
              <label className="block text-white/50 font-bold uppercase tracking-[0.15em] text-[10px] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 pr-12 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-sky-400 focus:bg-white/[0.08] font-medium shadow-inner transition duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-white/40 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black hover:bg-sky-400 hover:text-white font-bold tracking-widest uppercase rounded-2xl transition duration-300 text-xs shadow-2xl disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : (isRegister ? 'Complete Registration' : 'Sign In')}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="text-center text-xs text-white/50 font-medium">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-white font-bold hover:underline ml-1 cursor-pointer tracking-wider uppercase text-[11px]"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

        </div>

        {/* Right Side: Luxury 3D Holographic Security Showcase */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-white/[0.04] to-transparent p-12 flex-col items-center justify-center relative overflow-hidden">
          
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-blue-600/10 rounded-3xl blur-3xl animate-pulse"></div>
            
            {/* Glassmorphic 3D Card Mockup */}
            <div className="relative w-64 h-64 bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-6 space-y-5 transform hover:rotate-2 transition duration-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-sky-500/20">
                <Shield className="w-8 h-8" />
              </div>
              <div className="flex space-x-2">
                <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse"></span>
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-300"></span>
              </div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.25em]">SECURE WORKSPACE</p>
            </div>
          </div>

          <div className="mt-8 text-center space-y-1 z-10">
            <p className="text-xs font-bold text-white tracking-widest uppercase">Enterprise Grade Encryption</p>
            <p className="text-[11px] text-white/40 tracking-wider">Protected by Rigel Security Protocols</p>
          </div>

        </div>

      </div>
    </div>
  );
}