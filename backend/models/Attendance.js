const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-Day', 'On Leave'],
    default: 'Absent'
  },
  workingHours: {
    type: Number, // Stored in hours or minutes
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);