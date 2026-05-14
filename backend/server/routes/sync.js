import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { verifyToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/initialize', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { marketplace, email, activeClientId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    if (!marketplace) {
      return res.status(400).json({ success: false, message: 'Marketplace is required' });
    }

    const { clientId: jwtClientId, userId: jwtUserId, role } = req.user;

    // Resolve the *acting* client. For admins this is the client whose portal
    // they entered (activeClientId from the request body); for clients it is
    // themselves (from the JWT id). This guarantees strict data isolation
    // regardless of which role is logged in.
    let actingClient = null;
    try {
      const lookupId = role === 'admin' ? activeClientId : req.user.id;
      if (lookupId) {
        actingClient = await User.findById(lookupId).select('-password');
      }
    } catch (lookupErr) {
      console.warn('Could not resolve acting client by id:', lookupErr.message);
    }

    const resolvedClientId = actingClient?.clientId || (role === 'admin' ? null : jwtClientId);
    const resolvedClientName = actingClient?.clientName || null;
    const resolvedDbId = actingClient?.dbId || (role === 'admin' ? null : req.user.dbId) || null;

    if (role === 'admin' && !actingClient) {
      return res.status(400).json({
        success: false,
        message: 'No active client context. Admin must enter a client portal before triggering sync.'
      });
    }

    const formData = new FormData();
    const fileBlob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', fileBlob, file.originalname);
    formData.append('marketplace', marketplace);

    // Always attach the acting client's identifiers so n8n receives strictly
    // isolated context (never the admin's identity when admin is acting on
    // behalf of a client).
    if (resolvedClientId) formData.append('clientId', resolvedClientId);
    if (resolvedClientName) formData.append('clientName', resolvedClientName);
    if (resolvedDbId) formData.append('dbId', resolvedDbId);

    // Use the explicit email from frontend as userId for n8n Gmail delivery, fallback to JWT userId
    const finalUserId = email || (role === 'admin' ? actingClient?.username : jwtUserId);
    if (finalUserId) formData.append('userId', finalUserId);

    // The n8n workflow's Gmail node reads body.email for sendTo. Forward it as
    // a distinct field so the workflow expression $('Webhook1').first().json.body.email
    // resolves correctly (userId is kept for backward compat with other nodes).
    if (email) formData.append('email', email);

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    if (!N8N_WEBHOOK_URL) {
      console.error('N8N_WEBHOOK_URL is disconnected. Failing sync.');
      return res.status(503).json({ success: false, message: 'n8n is disconnected. Cannot process reconciliation.' });
    }

    // Forward the data to n8n with an increased timeout (10 minutes).
    // IMPORTANT: do NOT set Content-Type manually — axios derives the correct
    // multipart/form-data header *with the required boundary* from the
    // FormData body. Setting it manually drops the boundary and n8n responds
    // with a parse error.
    let response;
    try {
      response = await axios.post(N8N_WEBHOOK_URL, formData, {
        timeout: 600000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
    } catch (n8nErr) {
      const status = n8nErr.response?.status;
      const body = n8nErr.response?.data;
      console.error('[sync] n8n call failed:', {
        status,
        body,
        code: n8nErr.code,
        message: n8nErr.message,
        url: N8N_WEBHOOK_URL
      });

      // Build a user-friendly reason
      let reason;
      if (n8nErr.code === 'ECONNREFUSED' || n8nErr.code === 'ENOTFOUND') {
        reason = 'Cannot reach n8n webhook. Check N8N_WEBHOOK_URL is correct and the n8n server is running.';
      } else if (n8nErr.code === 'ECONNABORTED') {
        reason = 'n8n took too long to respond (timeout). Try again or check the workflow.';
      } else if (status) {
        const bodyMsg = typeof body === 'string' ? body : body?.message || body?.error || JSON.stringify(body);
        reason = `n8n returned ${status}${bodyMsg ? `: ${bodyMsg}` : ''}`;
      } else {
        reason = n8nErr.message || 'Unknown error contacting n8n';
      }

      return res.status(502).json({ success: false, message: reason });
    }

    res.json({ success: true, message: 'Sync initialized successfully', data: response.data });
  } catch (error) {
    console.error('Sync error:', error.response?.data || error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initialize sync'
    });
  }
});

export default router;
