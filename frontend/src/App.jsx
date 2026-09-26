import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import API from './services/api';
import { LogOut, User as UserIcon, Shield, Users, LayoutDashboard, UserCheck, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Selected Employee Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // My Profile Form State
  const [formData, setFormData] = useState({
    phone: '',
    dob: '',
    gender: '',
    address: '',
    qualification: '',
    institution: '',
    specialization: '',
    graduationYear: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser._id && parsedUser.id) parsedUser._id = parsedUser.id;
      setUser(parsedUser);
      setFormData({
        phone: parsedUser.phone || '',
        dob: parsedUser.dob || '',
        gender: parsedUser.gender || '',
        address: parsedUser.address || '',
        qualification: parsedUser.qualification || '',
        institution: parsedUser.institution || '',
        specialization: parsedUser.specialization || '',
        graduationYear: parsedUser.graduationYear || '',
        bankName: parsedUser.bankName || '',
        accountNumber: parsedUser.accountNumber || '',
        ifsc: parsedUser.ifsc || '',
        emergencyName: parsedUser.emergencyName || '',
        emergencyRelationship: parsedUser.emergencyRelationship || '',
        emergencyPhone: parsedUser.emergencyPhone || '',
      });
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    }
  }, [activeTab]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await API.get('/users');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleRowClick = async (empId) => {
    try {
      const response = await API.get(`/users/${empId}`);
      setSelectedEmployee(response.data);
    } catch (err) {
      console.error('Failed to fetch employee details', err);
    }
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
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={(userData) => {
      if (!userData._id && userData.id) userData._id = userData.id;
      setUser(userData);
      setFormData({
        phone: userData.phone || '',
        dob: userData.dob || '',
        gender: userData.gender || '',
        address: userData.address || '',
        qualification: userData.qualification || '',
        institution: userData.institution || '',
        specialization: userData.specialization || '',
        graduationYear: userData.graduationYear || '',
        bankName: userData.bankName || '',
        accountNumber: userData.accountNumber || '',
        ifsc: userData.ifsc || '',
        emergencyName: userData.emergencyName || '',
        emergencyRelationship: userData.emergencyRelationship || '',
        emergencyPhone: userData.emergencyPhone || '',
      });
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide">HR Portal</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            {/* Only visible to HR or Managers */}
            {(user.role === 'hr' || user.role === 'manager') && (
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'employees' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Employees</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <span>{user.name}</span>
            <span className="text-xs uppercase bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded font-semibold">
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-8 max-w-5xl mx-auto">
        {activeTab === 'dashboard' ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}! 👋</h1>
            <p className="text-slate-400 text-sm mb-6">
              You are logged in as <span className="text-indigo-400 font-semibold uppercase">{user.role}</span> in the <span className="text-white font-medium">{user.department}</span> department.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Attendance</h3>
                <p className="text-xl font-bold text-white">Not Checked In</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Leave Balance</h3>
                <p className="text-xl font-bold text-indigo-400">12 Days Available</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending Requests</h3>
                <p className="text-xl font-bold text-amber-400">0 Requests</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl space-y-8 font-mono">
            
            {/* Header */}
            <div className="border-b border-dashed border-slate-600 pb-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-widest text-white">MY PROFILE</h1>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-600/20 px-3 py-1 rounded border border-indigo-500/30">
                {user.role.toUpperCase()}
              </span>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-8">
              
              {/* Top Summary Card */}
              <div className="flex items-center space-x-4 p-4 bg-slate-900 border border-dashed border-slate-700 rounded-lg">
                <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xl rounded">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{user.name}</h2>
                  <p className="text-slate-400 text-xs">{user.designation || 'Full Stack Developer Intern'}</p>
                  <p className="text-indigo-400 text-xs mt-1">{user.employeeId || 'EMP0012'}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4 border-b border-dashed border-slate-700 pb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Personal Information</h3>
                  <span className="text-xs text-slate-500">[Editable]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Name</label>
                    <input type="text" disabled value={user.name} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Email</label>
                    <input type="text" disabled value={user.email} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-indigo-500">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-400 block mb-1">Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="City, State" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Employment Information (HR Controlled) */}
              <div className="space-y-4 border-b border-dashed border-slate-700 pb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Employment Information</h3>
                  <span className="text-xs text-amber-500/80">[Controlled by HR]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/50 p-4 rounded border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Employee ID</span>
                    <span className="text-white font-bold">{user.employeeId || 'EMP0012'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department</span>
                    <span className="text-white font-bold">{user.department || 'Engineering'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Designation</span>
                    <span className="text-white font-bold">{user.designation || 'Full Stack Developer Intern'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Joining Date</span>
                    <span className="text-white font-bold">{user.joiningDate || '10 Sept 2026'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Employment Type</span>
                    <span className="text-white font-bold">{user.employmentType || 'Internship'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reporting Manager</span>
                    <span className="text-white font-bold">{user.reportingManager || 'Aaquib Khan'}</span>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4 border-b border-dashed border-slate-700 pb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Education</h3>
                  <span className="text-xs text-slate-500">[Editable]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Qualification</label>
                    <input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. MCA" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Institution</label>
                    <input type="text" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} placeholder="College Name" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Specialization</label>
                    <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="Computer Applications" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Graduation Year</label>
                    <input type="text" value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} placeholder="2027" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4 border-b border-dashed border-slate-700 pb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Bank Details</h3>
                  <span className="text-xs text-slate-500">[Editable]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Bank Name</label>
                    <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Example Bank" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Account Number</label>
                    <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="********1234" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">IFSC</label>
                    <input type="text" value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value})} placeholder="XXXXXXXXX" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Emergency Contact</h3>
                  <span className="text-xs text-slate-500">[Editable]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Name</label>
                    <input type="text" value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} placeholder="Contact Name" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Relationship</label>
                    <input type="text" value={formData.emergencyRelationship} onChange={e => setFormData({...formData, emergencyRelationship: e.target.value})} placeholder="Parent / Spouse" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Phone</label>
                    <input type="text" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} placeholder="Phone Number" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white" />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-dashed border-slate-600 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold tracking-wider transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {savingProfile ? 'SAVING...' : '[Save Changes]'}
                </button>
              </div>

            </form>
          </div>
        ) : activeTab === 'employees' && (user.role === 'hr' || user.role === 'manager') ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Employee Directory</h1>
                <p className="text-slate-400 text-sm mt-1">Click on any employee row to view their complete profile</p>
              </div>
              <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-indigo-400 font-medium">
                Total: {employees.length} Members
              </span>
            </div>

            {loadingEmployees ? (
              <div className="text-center py-12 text-slate-400">Loading employees...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {employees.map((emp) => (
                      <tr
                        key={emp._id}
                        onClick={() => handleRowClick(emp._id)}
                        className="hover:bg-slate-900/60 transition cursor-pointer"
                      >
                        <td className="py-4 px-4 font-medium text-white flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-300">{emp.email}</td>
                        <td className="py-4 px-4 text-slate-300">{emp.department}</td>
                        <td className="py-4 px-4 text-slate-400">
                          {emp.joiningDate || new Date(emp.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto font-mono text-xs">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded bg-slate-900 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-4 mb-6 border-b border-dashed border-slate-700 pb-4">
              <div className="w-12 h-12 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                {selectedEmployee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{selectedEmployee.name}</h2>
                <p className="text-slate-400 text-xs">{selectedEmployee.designation || 'Full Stack Developer Intern'}</p>
                <p className="text-indigo-400 text-xs">{selectedEmployee.employeeId || 'EMP0012'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Personal Info */}
              <div className="bg-slate-900/60 p-4 rounded border border-slate-700/60 space-y-2">
                <h3 className="text-indigo-400 font-bold uppercase tracking-wider mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Phone:</span> <span className="text-white">{selectedEmployee.phone || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">DOB:</span> <span className="text-white">{selectedEmployee.dob || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">Gender:</span> <span className="text-white">{selectedEmployee.gender || 'Not Provided'}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Address:</span> <span className="text-white">{selectedEmployee.address || 'Not Provided'}</span></div>
                </div>
              </div>

              {/* Employment Info */}
              <div className="bg-slate-900/60 p-4 rounded border border-slate-700/60 space-y-2">
                <h3 className="text-amber-400 font-bold uppercase tracking-wider mb-2">Employment Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Department:</span> <span className="text-white">{selectedEmployee.department || 'Engineering'}</span></div>
                  <div><span className="text-slate-500">Joining Date:</span> <span className="text-white">{selectedEmployee.joiningDate || new Date(selectedEmployee.createdAt).toLocaleDateString()}</span></div>
                  <div><span className="text-slate-500">Type:</span> <span className="text-white">{selectedEmployee.employmentType || 'Internship'}</span></div>
                  <div><span className="text-slate-500">Manager:</span> <span className="text-white">{selectedEmployee.reportingManager || 'Aaquib Khan'}</span></div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-slate-900/60 p-4 rounded border border-slate-700/60 space-y-2">
                <h3 className="text-indigo-400 font-bold uppercase tracking-wider mb-2">Education</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Qualification:</span> <span className="text-white">{selectedEmployee.qualification || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">Institution:</span> <span className="text-white">{selectedEmployee.institution || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">Specialization:</span> <span className="text-white">{selectedEmployee.specialization || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">Graduation Year:</span> <span className="text-white">{selectedEmployee.graduationYear || 'Not Provided'}</span></div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-slate-900/60 p-4 rounded border border-slate-700/60 space-y-2">
                <h3 className="text-indigo-400 font-bold uppercase tracking-wider mb-2">Bank Details</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-slate-500">Bank:</span> <span className="text-white">{selectedEmployee.bankName || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">A/C:</span> <span className="text-white">{selectedEmployee.accountNumber || 'Not Provided'}</span></div>
                  <div><span className="text-slate-500">IFSC:</span> <span className="text-white">{selectedEmployee.ifsc || 'Not Provided'}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}