const router = require('express').Router();
const User = require('../models/User');
const { verifyToken, verifyHR } = require('../middleware/authMiddleware');

// 1. GET ALL USERS (For HR Employee Directory)
router.get('/', verifyHR, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET SINGLE USER PROFILE
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SELF-SERVICE PROFILE UPDATE (Employee editing their own profile)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Ensure an employee can only update their own profile unless they are HR
    if (req.user.id !== req.params.id && req.user.role !== 'hr' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. HR-CONTROLLED UPDATE (HR editing designation, department, status, manager)
router.put('/hr/:id', verifyHR, async (req, res) => {
  try {
    const { designation, department, employmentStatus, reportingManager, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(designation && { designation }),
          ...(department && { department }),
          ...(employmentStatus && { employmentStatus }),
          ...(reportingManager && { reportingManager }),
          ...(role && { role })
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'HR record updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;