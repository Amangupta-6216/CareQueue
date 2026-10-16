const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_doctor_queue_jwt_key_2026_antigravity',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Patient, Doctor, or Receptionist)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role = 'patient', 
      isSeniorCitizen,
      department,
      specialization,
      qualification,
      consultationFee 
    } = req.body;

    // Only allow self-registration for patient, doctor, and receptionist
    const allowedRoles = ['patient', 'doctor', 'receptionist'];
    const assignedRole = allowedRoles.includes(role) ? role : 'patient';

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      phone: phone || '',
      isSeniorCitizen: assignedRole === 'patient' ? Boolean(isSeniorCitizen) : false
    });

    // If registering as a doctor, create Doctor profile & generate 14-day consultation slots
    if (assignedRole === 'doctor') {
      const datesToSeed = [];
      const today = new Date();
      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        datesToSeed.push(d.toISOString().split('T')[0]);
      }

      const slots = [];
      for (const dStr of datesToSeed) {
        const startHours = [9, 10, 11, 14, 15, 16];
        for (const hour of startHours) {
          slots.push({
            date: dStr,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${hour.toString().padStart(2, '0')}:30`,
            isBooked: false
          });
          slots.push({
            date: dStr,
            startTime: `${hour.toString().padStart(2, '0')}:30`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            isBooked: false
          });
        }
      }

      await Doctor.create({
        user: user._id,
        department: department || 'General Medicine',
        specialization: specialization || 'General Practice',
        qualification: qualification || 'MBBS, MD',
        consultationFee: consultationFee ? Number(consultationFee) : 500,
        availableSlots: slots,
        onLeave: false
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isSeniorCitizen: user.isSeniorCitizen,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isSeniorCitizen: user.isSeniorCitizen,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
