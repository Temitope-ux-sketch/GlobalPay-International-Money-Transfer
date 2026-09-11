import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, nationality, address, preferredCurrency } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        address,
        preferredCurrency,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable 2FA
router.post('/enable-2fa', async (req, res) => {
  try {
    const { method } = req.body;

    if (!['sms', 'email', 'authenticator'].includes(method)) {
      return res.status(400).json({ error: 'Invalid 2FA method' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        twoFactorEnabled: true,
        twoFactorMethod: method
      },
      { new: true }
    );

    res.json({
      message: '2FA enabled successfully',
      method
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transfer statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      dailyLimit: user.limits.dailyLimit,
      dailyUsed: user.limits.dailyUsed,
      dailyRemaining: user.limits.dailyLimit - user.limits.dailyUsed,
      monthlyLimit: user.limits.monthlyLimit,
      monthlyUsed: user.limits.monthlyUsed,
      monthlyRemaining: user.limits.monthlyLimit - user.limits.monthlyUsed,
      accountStatus: user.accountStatus,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
