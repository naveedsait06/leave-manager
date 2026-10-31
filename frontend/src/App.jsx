import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import API from './services/api';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LeavePage from './pages/Leave';
import ManagerDashboard from './pages/ManagerDashboard';
import { Search, X, Plus, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Selected Employee Modal State & Manager Edit Mode
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editEmployeeForm, setEditEmployeeForm] = useState({});

  // Attendance State
  const [attendance, setAttendance] = useState({
    status: 'Not Checked In',
    checkInTime: null,
    checkOutTime: null,
    workingHours: 0
  });
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Manager Manage Attendance State
  const [manageAttendanceDate, setManageAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchEmpId, setSearchEmpId] = useState('');

  // Manager Leave Approvals
  const [allLeaves, setAllLeaves] = useState([]);
  const [loadingAllLeaves, setLoadingAllLeaves] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);

  // My Profile Form State
  const [formData, setFormData] = useState({
    phone: '', dob: '', gender: '', address: '',
    qualification: '', institution: '', specialization: '', graduationYear: '',
    bankName: '', accountNumber: '', ifsc: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    employeeId: '', department: '', designation: '', joiningDate: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      let rawId = parsedUser._id || parsedUser.id || '';
      if (rawId.includes(':')) rawId = rawId.split(':')[0];
      parsedUser._id = rawId;

      setUser(parsedUser);
      setFormData({
        phone: parsedUser.phone || '', dob: parsedUser.dob || '', gender: parsedUser.gender || '', address: parsedUser.address || '',
        qualification: parsedUser.qualification || '', institution: parsedUser.institution || '', specialization: parsedUser.specialization || '', graduationYear: parsedUser.graduationYear || '',
        bankName: parsedUser.bankName || '', accountNumber: parsedUser.accountNumber || '', ifsc: parsedUser.ifsc || '',
        emergencyName: parsedUser.emergencyName || '', emergencyRelationship: parsedUser.emergencyRelationship || '', emergencyPhone: parsedUser.emergencyPhone || '',
        employeeId: parsedUser.employeeId || '', department: parsedUser.department || '', designation: parsedUser.designation || '', joiningDate: parsedUser.joiningDate || '',
      });
      refreshUserProfile(rawId);
    }
  }, []);

  const refreshUserProfile = async (userId) => {
    try {
      const res = await API.get(`/users/${userId}`);
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (location.pathname === '/dashboard' || location.pathname === '/') {
      fetchTodayAttendance();
      if (user.role === 'manager') fetchAllLeaves();
    } else if (location.pathname === '/attendance') {
      if (user.role === 'manager') fetchEmployees();
      else fetchAttendanceHistory();
    } else if (location.pathname === '/manager-leaves' && user.role === 'manager') {
      fetchAllLeaves();
    } else if (location.pathname === '/employees' && user.role === 'manager') {
      fetchEmployees();
    }
  }, [location.pathname, user]);

  const fetchTodayAttendance = async () => {
    try {
      const res = await API.get('/attendance/today');
      setAttendance(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await API.get('/attendance/history');
      setAttendanceHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCheckIn = async () => {
    try {
      const res = await API.post('/attendance/check-in');
      setAttendance(res.data.attendance);
      setAttendanceMessage(res.data.message);
      setTimeout(() => setAttendanceMessage(''), 4000);
    } catch (err) {
      setAttendanceMessage(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.post('/attendance/check-out');
      setAttendance(res.data.attendance);
      setAttendanceMessage(res.data.message);
      setTimeout(() => setAttendanceMessage(''), 4000);
    } catch (err) {
      setAttendanceMessage(err.response?.data?.message || 'Check-out failed');
    }
  };

  const fetchAllLeaves = async () => {
    setLoadingAllLeaves(true);
    try {
      const res = await API.get('/leaves/all');
      setAllLeaves(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingAllLeaves(false); }
  };

  const handleLeaveAction = async (leaveId, status, rejectionReason = '') => {
    try {
      await API.put(`/leaves/${leaveId}/status`, { status, rejectionReason });
      fetchAllLeaves();
      setRejectingLeaveId(null);
      setRejectionReasonInput('');
    } catch (err) {
      alert('Failed to update leave status: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await API.get('/users');
      setEmployees(response.data);
    } catch (err) { console.error(err); }
    finally { setLoadingEmployees(false); }
  };

  const handleRowClick = async (empId) => {
    try {
      const response = await API.get(`/users/${empId}`);
      setSelectedEmployee(response.data);
      setEditEmployeeForm({
        phone: response.data.phone || '', department: response.data.department || '',
        designation: response.data.designation || '', employeeId: response.data.employeeId || '',
        employmentType: response.data.employmentType || '', reportingManager: response.data.reportingManager || '',
        qualification: response.data.qualification || '', institution: response.data.institution || '',
      });
      setIsEditingEmployee(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateEmployeeByManager = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/users/${selectedEmployee._id}`, editEmployeeForm);
      setSelectedEmployee(res.data);
      alert('Employee profile updated successfully!');
      setIsEditingEmployee(false);
      fetchEmployees();
    } catch (err) { alert('Failed to update employee: ' + (err.response?.data?.error || err.message)); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    try {
      const response = await API.put(`/users/${user._id}`, formData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally { setSavingProfile(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const pendingLeaveRequests = allLeaves.filter(l => l.status === 'Pending');

  if (!user) {
    return <Login onLoginSuccess={(userData) => {
      let rawId = userData._id || userData.id || '';
      if (rawId.includes(':')) rawId = rawId.split(':')[0];
      userData._id = rawId;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#030508] text-white flex font-sans selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none"></div>

      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen z-10">
        <Topbar user={user} pendingLeaveRequests={pendingLeaveRequests} onLogout={handleLogout} />

        <main className="p-6 sm:p-10 max-w-7xl mx-auto w-full flex-1 space-y-8">
          <Routes>
            {['/', '/dashboard'].map((path) => (
              <Route key={path} path={path} element={
                user.role === 'manager' ? (
                  <ManagerDashboard user={user} />
                ) : (
                  <div className="space-y-8 animate-[fadeIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
                    
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="space-y-3 z-10">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[11px] font-bold tracking-widest uppercase">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live Workspace — Active</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white font-serif">
                          Good morning, {user.name} 👋
                        </h1>
                        <p className="text-white/60 text-xs sm:text-sm max-w-xl leading-relaxed font-light">
                          Monitor your real-time attendance timestamps, check leave quotas, and manage time-off requests seamlessly.
                        </p>
                      </div>

                      <div className="z-10 bg-white/[0.04] border border-white/10 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
                        <div className={`w-3.5 h-3.5 rounded-full ${attendance.checkInTime ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`}></div>
                        <div>
                          <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/40">Status</p>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{attendance.status}</p>
                        </div>
                      </div>
                    </div>

                    {attendanceMessage && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl flex items-center space-x-3 font-semibold">
                        <span>✨</span>
                        <span>{attendanceMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition group">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Today's Date</p>
                        <p className="text-2xl sm:text-3xl font-light text-white mt-4 tracking-tight font-serif">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-sky-400 mt-2 font-medium tracking-wider uppercase text-[10px]">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}, Active Shift</p>
                      </div>

                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition group">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Check-In Timestamp</p>
                        <p className="text-2xl sm:text-3xl font-light text-white mt-4 tracking-tight font-mono">
                          {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                        <p className="text-xs text-emerald-400 mt-2 font-medium tracking-wider uppercase text-[10px]">{attendance.checkInTime ? 'Recorded successfully' : 'Not marked yet'}</p>
                      </div>

                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-white/20 p-7 rounded-[2rem] shadow-xl transition group">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Working Hours</p>
                        <p className="text-2xl sm:text-3xl font-light text-white mt-4 tracking-tight font-mono">
                          {attendance.workingHours} <span className="text-sm font-normal text-white/50">hrs</span>
                        </p>
                        <p className="text-xs text-amber-400 mt-2 font-medium tracking-wider uppercase text-[10px]">Accumulated today</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-7 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                      <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xl">🕒</div>
                        <div>
                          <h3 className="text-base font-bold text-white">Attendance Control Panel</h3>
                          <p className="text-xs text-white/50 mt-1">
                            {!attendance.checkInTime ? "You haven't marked your attendance for today's shift." : !attendance.checkOutTime ? `Active shift checked in at ${new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Shift completed for today."}
                          </p>
                        </div>
                      </div>
                      <div>
                        {!attendance.checkInTime ? (
                          <button onClick={handleCheckIn} className="px-8 py-3.5 bg-white text-black hover:bg-sky-400 hover:text-white rounded-2xl text-xs font-bold tracking-widest uppercase transition duration-300 shadow-2xl cursor-pointer">[ Check In Now ]</button>
                        ) : !attendance.checkOutTime ? (
                          <button onClick={handleCheckOut} className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold tracking-widest uppercase transition duration-300 shadow-2xl cursor-pointer">[ Check Out ]</button>
                        ) : (
                          <span className="px-6 py-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-500/20 flex items-center space-x-2"><span>✓</span><span>Shift Completed</span></span>
                        )}
                      </div>
                    </div>

                    {/* Leave Balance Quotas */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Leave Balance Allocations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-xl">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Casual Leave</p>
                          <p className="text-3xl font-light text-white font-serif mt-2">{user.leaveBalance?.casualLeave ?? 12} <span className="text-xs text-white/40 font-sans">/ 12 days</span></p>
                        </div>
                        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-xl">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Sick Leave</p>
                          <p className="text-3xl font-light text-white font-serif mt-2">{user.leaveBalance?.sickLeave ?? 10} <span className="text-xs text-white/40 font-sans">/ 10 days</span></p>
                        </div>
                        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-xl">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Earned Leave</p>
                          <p className="text-3xl font-light text-white font-serif mt-2">{user.leaveBalance?.earnedLeave ?? 15} <span className="text-xs text-white/40 font-sans">/ 15 days</span></p>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              } />
            ))}

            <Route path="/profile" element={
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-8 font-mono">
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <h1 className="text-lg font-bold tracking-[0.25em] text-white uppercase">MASTER PROFILE</h1>
                </div>
                {profileSuccess && <div className="p-4 bg-emerald-500/10 text-emerald-300 text-xs rounded-2xl font-sans font-bold">{profileSuccess}</div>}
                <form onSubmit={handleProfileUpdate} className="space-y-8 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-white/40 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Phone</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-white/40 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Address</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2"><button type="submit" disabled={savingProfile} className="px-8 py-4 bg-white text-black hover:bg-sky-400 rounded-2xl text-xs font-bold uppercase cursor-pointer">Save Changes</button></div>
                </form>
              </div>
            } />

            {/* Attendance Route (Manager sees employee-only list) */}
            <Route path="/attendance" element={
              user.role === 'manager' ? (
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-6">
                  <h1 className="text-2xl sm:text-3xl font-light text-white font-serif">Manage Attendance</h1>
                  <div className="relative max-w-sm">
                    <input type="text" value={searchEmpId} onChange={(e) => setSearchEmpId(e.target.value)} placeholder="Search By Employee ID or Name..." className="w-full pl-4 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white outline-none" />
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-bold"><th className="py-4 px-4">Name</th><th className="py-4 px-4">Emp Id</th><th className="py-4 px-4">Department</th><th className="py-4 px-4">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {employees
                        .filter(emp => emp.role !== 'manager' && emp.role !== 'hr')
                        .filter(emp => !searchEmpId || (emp.employeeId && emp.employeeId.toLowerCase().includes(searchEmpId.toLowerCase())) || emp.name.toLowerCase().includes(searchEmpId.toLowerCase()))
                        .map(emp => (
                          <tr key={emp._id}>
                            <td className="py-4 px-4 text-white font-bold">{emp.name}</td>
                            <td className="py-4 px-4 text-sky-400 font-mono">{emp.employeeId}</td>
                            <td className="py-4 px-4 text-white/60">{emp.department}</td>
                            <td className="py-4 px-4"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold">Present</span></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-6">
                  <h1 className="text-2xl font-light text-white font-serif">Attendance History</h1>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-bold"><th className="py-4 px-4">Date</th><th className="py-4 px-4">Hours</th><th className="py-4 px-4">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {attendanceHistory.map(log => (
                        <tr key={log._id}><td className="py-4 px-4 text-white font-bold">{log.date}</td><td className="py-4 px-4 text-sky-400">{log.workingHours} hrs</td><td className="py-4 px-4 text-emerald-400">{log.status}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            } />

            {/* Leave Page Route */}
            <Route path="/leave" element={<LeavePage user={user} />} />

            {/* Manager Routes */}
            {user.role === 'manager' && (
              <>
                <Route path="/employees" element={
                  <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                    <h1 className="text-2xl sm:text-3xl font-light text-white font-serif mb-6">Team Directory (Employees)</h1>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">
                            <th className="py-4 px-4">Name</th>
                            <th className="py-4 px-4">Email</th>
                            <th className="py-4 px-4">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {employees
                            .filter(emp => emp.role !== 'manager' && emp.role !== 'hr')
                            .map((emp) => (
                              <tr key={emp._id} onClick={() => handleRowClick(emp._id)} className="hover:bg-white/[0.02] cursor-pointer transition">
                                <td className="py-4 px-4 font-bold text-white">{emp.name}</td>
                                <td className="py-4 px-4 text-white/60">{emp.email}</td>
                                <td className="py-4 px-4 text-sky-400 font-semibold">{emp.department}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                } />

                <Route path="/manager-leaves" element={
                  <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-light text-white font-serif">Leave Approval Queue</h1>
                        <p className="text-white/50 text-xs sm:text-sm mt-1">Review and manage team leave applications.</p>
                      </div>
                      <span className="bg-white/[0.05] border border-white/10 px-4 py-2 rounded-2xl text-xs text-white font-bold">
                        Total Requests: {allLeaves.length}
                      </span>
                    </div>

                    {loadingAllLeaves ? (
                      <div className="text-center py-12 text-white/40 text-sm">Loading leave requests...</div>
                    ) : allLeaves.length === 0 ? (
                      <div className="text-center py-12 text-white/40 text-sm">No leave applications found in the system.</div>
                    ) : (
                      <div className="space-y-4">
                        {allLeaves.map((leave) => (
                          <div key={leave._id} className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <div className="flex items-center space-x-3">
                                  <span className="font-bold text-white text-base">{leave.employee?.name || 'Unknown Employee'}</span>
                                  <span className="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full font-bold">{leave.employee?.department || 'Staff'}</span>
                                </div>
                                <p className="text-xs text-white/60 mt-1 font-mono">
                                  <strong className="text-white">{leave.leaveType}</strong> · {leave.fromDate} to {leave.toDate}
                                </p>
                                <p className="text-xs text-white/80 mt-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
                                  <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Reason:</span> {leave.reason}
                                </p>
                              </div>

                              <div className="flex items-center space-x-3 self-end md:self-center">
                                {leave.status === 'Pending' ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleLeaveAction(leave._id, 'Approved')}
                                      className="px-5 py-3 bg-white text-black hover:bg-sky-400 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xl"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => setRejectingLeaveId(leave._id)}
                                      className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xl"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : leave.status === 'Approved' ? (
                                  <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-bold">
                                    ✓ Approved
                                  </span>
                                ) : (
                                  <span className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold">
                                    × Rejected
                                  </span>
                                )}
                              </div>
                            </div>

                            {rejectingLeaveId === leave._id && (
                              <div className="pt-4 border-t border-white/10 flex items-center space-x-3">
                                <input
                                  type="text"
                                  placeholder="Enter reason for rejection..."
                                  value={rejectionReasonInput}
                                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                                  className="flex-1 p-3.5 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white outline-none font-medium placeholder-white/30"
                                />
                                <button
                                  onClick={() => handleLeaveAction(leave._id, 'Rejected', rejectionReasonInput)}
                                  className="px-5 py-3.5 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-500 cursor-pointer shadow-xl"
                                >
                                  Confirm Rejection
                                </button>
                                <button
                                  onClick={() => { setRejectingLeaveId(null); setRejectionReasonInput(''); }}
                                  className="px-5 py-3.5 bg-white/[0.05] text-white/70 hover:text-white rounded-2xl text-xs font-bold cursor-pointer transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {leave.status === 'Rejected' && leave.rejectionReason && (
                              <p className="text-xs text-rose-400 pt-3 border-t border-white/10 font-semibold">
                                <strong>Rejection Note:</strong> {leave.rejectionReason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                } />
              </>
            )}

          </Routes>
        </main>
      </div>

      {/* Selected Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#090d16] border border-white/15 rounded-[2.5rem] w-full max-w-2xl p-8 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans text-xs">
            <button
              onClick={() => { setSelectedEmployee(null); setIsEditingEmployee(false); }}
              className="absolute top-6 right-6 text-white/40 hover:text-white p-2.5 rounded-2xl bg-white/[0.05] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xl">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedEmployee.name}</h2>
                  <p className="text-white/50 text-xs">{selectedEmployee.designation || 'Staff'} · {selectedEmployee.department}</p>
                  <p className="text-sky-400 font-mono text-xs font-bold">{selectedEmployee.employeeId || 'EMP0000'}</p>
                </div>
              </div>

              {user.role === 'manager' && (
                <button
                  onClick={() => setIsEditingEmployee(!isEditingEmployee)}
                  className="px-5 py-2.5 bg-white text-black hover:bg-sky-400 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xl"
                >
                  {isEditingEmployee ? 'Cancel Edit' : 'Edit Profile [Manager]'}
                </button>
              )}
            </div>

            {!isEditingEmployee ? (
              <div className="space-y-4">
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 space-y-2">
                  <h3 className="text-white/70 font-bold uppercase tracking-[0.15em] text-[10px] mb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-white/70">
                    <div><span className="text-white/40 font-bold">Phone:</span> <span className="text-white font-semibold">{selectedEmployee.phone || 'Not Provided'}</span></div>
                    <div><span className="text-white/40 font-bold">Email:</span> <span className="text-white font-semibold">{selectedEmployee.email}</span></div>
                    <div><span className="text-white/40 font-bold">DOB:</span> <span className="text-white font-semibold">{selectedEmployee.dob || 'Not Provided'}</span></div>
                    <div><span className="text-white/40 font-bold">Gender:</span> <span className="text-white font-semibold">{selectedEmployee.gender || 'Not Provided'}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateEmployeeByManager} className="space-y-4">
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-white/70 font-bold uppercase tracking-[0.15em] text-[10px]">Edit Employee Details [Manager Control]</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 block mb-1 font-bold">Department</label>
                      <input type="text" value={editEmployeeForm.department} onChange={e => setEditEmployeeForm({...editEmployeeForm, department: e.target.value})} className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none font-semibold" />
                    </div>
                    <div>
                      <label className="text-white/40 block mb-1 font-bold">Designation</label>
                      <input type="text" value={editEmployeeForm.designation} onChange={e => setEditEmployeeForm({...editEmployeeForm, designation: e.target.value})} className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2.5 bg-white text-black hover:bg-sky-400 rounded-xl font-bold cursor-pointer shadow-xl transition">Save Changes</button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={() => { setSelectedEmployee(null); setIsEditingEmployee(false); }} className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-2xl font-bold transition cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}