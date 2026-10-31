import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar, X, Plus, ChevronDown, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function LeavePage({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    setLeaveError('');
    setLeaveSuccess('');
    try {
      await API.post('/leaves/apply', leaveForm);
      setIsApplyModalOpen(false);
      setLeaveForm({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
      setLeaveSuccess('Leave request submitted successfully!');
      setTimeout(() => setLeaveSuccess(''), 4000);
    } catch (err) {
      setLeaveError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await API.put(`/leaves/${leaveId}/status`, { status: 'Rejected', rejectionReason: 'Cancelled by employee' });
      fetchLeaves();
    } catch (err) {
      alert('Failed to cancel leave request');
    }
  };

  const calculateDuration = (from, to) => {
    if (!from || !to) return 1;
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === 'All') return true;
    return leave.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Top Header Card (Hidden Apply Leave for Managers) */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-white font-serif tracking-tight">
            {user?.role === 'manager' ? 'Team Leave Overview' : 'Leave Requests'}
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            {user?.role === 'manager' 
              ? 'As a manager, please use the Leave Approvals section to review staff applications.' 
              : 'Track leave lifecycles, view application durations, and submit new requests.'}
          </p>
        </div>
        {user?.role !== 'manager' && (
          <button 
            onClick={() => { setIsApplyModalOpen(true); setLeaveError(''); setLeaveSuccess(''); }} 
            className="px-7 py-3.5 bg-white text-black hover:bg-sky-400 hover:text-white rounded-2xl text-xs font-bold tracking-widest uppercase transition duration-300 shadow-2xl cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      {leaveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl flex items-center space-x-3 font-semibold">
          <span>✨</span>
          <span>{leaveSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & List Container */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-5">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                filterStatus === status 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                  : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Leave Requests Stream */}
        {loading ? (
          <div className="text-center py-16 text-white/40 text-sm">Loading leave applications...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-xs space-y-2">
            <p>No leave requests found under "{filterStatus}".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => {
              const durationDays = calculateDuration(leave.fromDate, leave.toDate);
              const isExpanded = expandedId === leave._id;

              return (
                <div 
                  key={leave._id} 
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 p-6 rounded-3xl transition-all duration-300 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    <div className="space-y-1.5 cursor-pointer flex-1" onClick={() => setExpandedId(isExpanded ? null : leave._id)}>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-base tracking-wide">{leave.leaveType}</span>
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                          {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 font-mono">
                        {leave.fromDate} → {leave.toDate}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {leave.status === 'Pending' && (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Pending Review</span>
                          </span>
                          {user?.role !== 'manager' && (
                            <button
                              onClick={() => handleCancelLeave(leave._id)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[11px] font-bold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                      {leave.status === 'Approved' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {leave.status === 'Rejected' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}

                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : leave._id)}
                        className="text-white/40 hover:text-white p-2 rounded-xl bg-white/[0.05] transition cursor-pointer"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-white/10 space-y-3 text-xs animate-[fadeIn_0.3s_ease]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-white/40 uppercase tracking-wider text-[10px] font-bold">Reason Provided</p>
                          <p className="text-white/80 mt-1 font-medium">{leave.reason}</p>
                        </div>
                        <div>
                          <p className="text-white/40 uppercase tracking-wider text-[10px] font-bold">Approver / Manager</p>
                          <p className="text-white/80 mt-1 font-medium">Aaquib Khan (Reporting Manager)</p>
                        </div>
                      </div>

                      {leave.status === 'Rejected' && leave.rejectionReason && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
                          <span className="font-bold">Rejection Note:</span> {leave.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && user?.role !== 'manager' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#090d16] border border-white/15 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-light text-white font-serif">Apply for Leave</h2>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer p-2 rounded-xl bg-white/[0.05]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-5 text-xs">
              {leaveError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl flex items-center space-x-2 font-bold">
                  <span>⚠️</span>
                  <span>{leaveError}</span>
                </div>
              )}

              <div>
                <label className="block text-white/50 mb-2 uppercase font-bold tracking-[0.15em] text-[10px]">Leave Type</label>
                <select 
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                  className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none font-semibold"
                >
                  <option value="Casual Leave" className="bg-[#090d16]">Casual Leave</option>
                  <option value="Sick Leave" className="bg-[#090d16]">Sick Leave</option>
                  <option value="Earned Leave" className="bg-[#090d16]">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 mb-2 uppercase font-bold tracking-[0.15em] text-[10px]">From Date</label>
                  <input 
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({...leaveForm, fromDate: e.target.value})}
                    className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-white/50 mb-2 uppercase font-bold tracking-[0.15em] text-[10px]">To Date</label>
                  <input 
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({...leaveForm, toDate: e.target.value})}
                    className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/50 mb-2 uppercase font-bold tracking-[0.15em] text-[10px]">Reason</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Enter reason..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  className="w-full p-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white outline-none font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-6 py-3.5 bg-white/[0.05] text-white/70 hover:text-white rounded-2xl font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={leaveSubmitting}
                  className="px-6 py-3.5 bg-white text-black hover:bg-sky-400 hover:text-white rounded-2xl font-bold tracking-widest uppercase cursor-pointer shadow-xl transition disabled:opacity-50"
                >
                  {leaveSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}