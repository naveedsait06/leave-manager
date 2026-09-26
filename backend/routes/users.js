const router = require('express').Router();
const User = require('../models/User');

// GET ONLY EMPLOYEES
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE USER BY ID
router.get('/:id', async (req, res) => {
  try {
    const singleUser = await User.findById(req.params.id).select('-password');
    if (!singleUser) return res.status(404).json({ message: 'User not found' });
    res.json(singleUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER PROFILE
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          phone: req.body.phone,
          dob: req.body.dob,
          gender: req.body.gender,
          address: req.body.address,
          qualification: req.body.qualification,
          institution: req.body.institution,
          specialization: req.body.specialization,
          graduationYear: req.body.graduationYear,
          bankName: req.body.bankName,
          accountNumber: req.body.accountNumber,
          ifsc: req.body.ifsc,
          emergencyName: req.body.emergencyName,
          emergencyRelationship: req.body.emergencyRelationship,
          emergencyPhone: req.body.emergencyPhone,
        }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;