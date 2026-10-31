const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

// 1. APPLY FOR LEAVE (Employee)
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    
    // Calculate inclusive leave days requested
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Fetch user and ensure leaveBalance exists
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fallback defaults if user document doesn't have leaveBalance initialized
    const balanceObj = user.leaveBalance || { casualLeave: 12, sickLeave: 10, earnedLeave: 15 };

    let currentBalance = 12;
    if (leaveType.includes('Casual')) currentBalance = balanceObj.casualLeave ?? 12;
    else if (leaveType.includes('Sick')) currentBalance = balanceObj.sickLeave ?? 10;
    else if (leaveType.includes('Earned')) currentBalance = balanceObj.earnedLeave ?? 15;

    console.log(`[LEAVE CHECK] User: ${user.name} | Type: ${leaveType} | Requested: ${requestedDays} | Available: ${currentBalance}`);

    if (requestedDays > currentBalance) {
      return res.status(400).json({ 
        error: `Insufficient balance! You requested ${requestedDays} days, but you only have ${currentBalance} days remaining.` 
      });
    }

    const newLeave = new Leave({
      employee: req.user.id,
      leaveType: leaveType.includes('Casual') ? 'Casual Leave' : leaveType.includes('Sick') ? 'Sick Leave' : 'Earned Leave',
      fromDate,
      toDate,
      reason
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET LOGGED-IN EMPLOYEE'S LEAVES
router.get('/my-leaves', verifyToken, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET ALL LEAVES (HR / Manager review queue)
router.get('/all', verifyToken, verifyHR, async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employee', 'name email employeeId department').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. APPROVE OR REJECT LEAVE (HR / Manager action)
router.put('/:id/status', verifyToken, verifyHR, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; 
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (status === 'Approved' && leave.status === 'Pending') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const user = await User.findById(leave.employee._id);
      if (user) {
        if (!user.leaveBalance) user.leaveBalance = { casualLeave: 12, sickLeave: 10, earnedLeave: 15 };
        
        if (leave.leaveType.includes('Casual')) user.leaveBalance.casualLeave = Math.max(0, user.leaveBalance.casualLeave - diffDays);
        if (leave.leaveType.includes('Sick')) user.leaveBalance.sickLeave = Math.max(0, user.leaveBalance.sickLeave - diffDays);
        if (leave.leaveType.includes('Earned')) user.leaveBalance.earnedLeave = Math.max(0, user.leaveBalance.earnedLeave - diffDays);
        await user.save();
      }
    }

    leave.status = status;
    if (rejectionReason) leave.rejectionReason = rejectionReason;

    await leave.save();
    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;