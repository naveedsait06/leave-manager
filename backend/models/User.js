const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Source 1: Registration
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'hr'], default: 'employee' },
  department: { type: String, default: 'Engineering' },

  // Source 2: Employee Self-Service Fields
  phone: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  address: { type: String, default: '' },
  
  // Education
  qualification: { type: String, default: 'MCA' },
  institution: { type: String, default: '' },
  specialization: { type: String, default: '' },
  graduationYear: { type: String, default: '' },

  // Bank Details
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },

  // Emergency Contact
  emergencyName: { type: String, default: '' },
  emergencyRelationship: { type: String, default: '' },
  emergencyPhone: { type: String, default: '' },

  // Source 3: HR Controlled Fields
  employeeId: { type: String, default: function() { return 'EMP' + Math.floor(1000 + Math.random() * 9000); } },
  designation: { type: String, default: 'Full Stack Developer Intern' },
  joiningDate: { type: String, default: new Date().toLocaleDateString() },
  employmentType: { type: String, default: 'Internship' },
  reportingManager: { type: String, default: 'Aaquib Khan' },

  leaveBalance: {
    casualLeave: { type: Number, default: 12 },
    sickLeave: { type: Number, default: 10 },
    earnedLeave: { type: Number, default: 15 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);