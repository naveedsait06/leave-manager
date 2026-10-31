const router = require('express').Router();
const Attendance = require('../models/Attendance');
const { verifyToken } = require('../middleware/authMiddleware');

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// 1. GET TODAY'S ATTENDANCE STATUS FOR LOGGED-IN EMPLOYEE
router.get('/today', verifyToken, async (req, res) => {
  try {
    const today = getTodayDate();
    let attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today
    });

    if (!attendance) {
      attendance = { status: 'Not Checked In', checkInTime: null, checkOutTime: null, workingHours: 0 };
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CHECK IN
router.post('/check-in', verifyToken, async (req, res) => {
  try {
    const today = getTodayDate();
    let attendance = await Attendance.findOne({ employee: req.user.id, date: today });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: req.user.id,
        date: today,
        status: 'Present',
        checkInTime: new Date()
      });
    } else {
      attendance.checkInTime = new Date();
      attendance.status = 'Present';
    }

    await attendance.save();
    res.json({ message: 'Checked in successfully', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CHECK OUT
router.post('/check-out', verifyToken, async (req, res) => {
  try {
    const today = getTodayDate();
    const attendance = await Attendance.findOne({ employee: req.user.id, date: today });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'You have not checked in yet today' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();

    // Calculate working hours
    const diffMs = attendance.checkOutTime - new Date(attendance.checkInTime);
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workingHours = diffHours;

    await attendance.save();
    res.json({ message: 'Checked out successfully', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL ATTENDANCE LOGS FOR LOGGED-IN USER
router.get('/history', verifyToken, async (req, res) => {
  try {
    const logs = await Attendance.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

module.exports = router;