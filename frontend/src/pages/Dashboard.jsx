import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeeDashboard() {
  const [attendance, setAttendance] = useState({
    status: 'Loading...',
    checkInTime: null,
    checkOutTime: null,
    workingHours: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch today's attendance status on load
  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/attendance/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  // Handle Check-In
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/attendance/check-in', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.attendance);
      setMessage(res.data.message);
      setLoading(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in failed');
      setLoading(false);
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/attendance/check-out', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.attendance);
      setMessage(res.data.message);
      setLoading(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-out failed');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Good morning, Employee</h1>
        <p className="text-gray-500">Here is your daily summary and quick actions.</p>
      </div>

      {message && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 text-sm">
          {message}
        </div>
      )}

      {/* Today's Attendance Widget */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Today's Attendance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="text-lg font-bold text-indigo-600">{attendance.status}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Check In</p>
            <p className="text-md font-semibold text-gray-700">
              {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : '--:--'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Check Out</p>
            <p className="text-md font-semibold text-gray-700">
              {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : '--:--'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Working Hours</p>
            <p className="text-md font-bold text-green-600">{attendance.workingHours} hrs</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleCheckIn}
            disabled={loading || (attendance.checkInTime && !attendance.checkOutTime)}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={loading || !attendance.checkInTime || attendance.checkOutTime}
            className="px-6 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 disabled:opacity-50 transition"
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition">
            Apply Leave
          </button>
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition">
            View Attendance History
          </button>
          <button className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}