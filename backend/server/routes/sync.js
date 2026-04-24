import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/initialize', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { marketplace, email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    if (!marketplace) {
      return res.status(400).json({ success: false, message: 'Marketplace is required' });
    }

    const { clientId, userId: jwtUserId } = req.user;

    const formData = new FormData();
    const fileBlob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', fileBlob, file.originalname);
    formData.append('marketplace', marketplace);
    
    // Automatically append clientId from the JWT
    if (clientId) formData.append('clientId', clientId);
    
    // Use the explicit email from frontend as userId for n8n Gmail delivery, fallback to JWT userId
    const finalUserId = email || jwtUserId;
    if (finalUserId) formData.append('userId', finalUserId);

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    if (!N8N_WEBHOOK_URL) {
      console.log('N8N_WEBHOOK_URL is temporarily disconnected, bypassing n8n sync.');
      return res.json({ success: true, message: 'Sync initialized successfully (mocked)', data: {} });
    }

    // Forward the data to n8n
    const response = await axios.post(N8N_WEBHOOK_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    res.json({ success: true, message: 'Sync initialized successfully', data: response.data });
  } catch (error) {
    console.error('Sync error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to initialize sync with n8n' });
  }
});

export default router;
