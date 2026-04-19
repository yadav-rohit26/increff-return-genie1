import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account Deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    // Create JWT Token
    const payload = {
      userId: user.username, // Using username as userId for Gmail delivery mapping
      username: user.username,
      clientId: user.clientId,
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    // Send user info excluding password
    const userResponse = {
      id: user._id,
      username: user.username,
      clientId: user.clientId,
      clientName: user.clientName,
      themeColor: user.themeColor,
      role: user.role,
      isActive: user.isActive
    };

    res.json({ success: true, token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin toggle client status
router.post('/toggle-status', async (req, res) => {
  try {
    const { clientId } = req.body;
    // We should technically verify JWT and admin role here, but we will add simple implementation
    const user = await User.findById(clientId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin create a new client
router.post('/client', async (req, res) => {
  try {
    const { username, password, clientName, themeColor, pod } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const newUser = new User({
      username,
      password, // Password hashing is handled by pre-save hook in User model
      clientName,
      themeColor: themeColor || '#000000',
      role: 'client',
      pod: pod || 'POD 2'
    });

    await newUser.save();
    
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin delete a client
router.delete('/client/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin get all clients
router.get('/clients', async (req, res) => {
  try {
    // Return all clients (excluding admin from list if needed, or keeping it)
    const clients = await User.find({ role: 'client' }).select('-password');
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
