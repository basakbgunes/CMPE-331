// backend/src/api/routes/debugRoute.js
const express = require('express');
const router = express.Router();

// POST /api/debug/ping
router.post('/debug/ping', (req, res) => {
  console.log('Hit /api/debug/ping');
  res.status(200).json({
    ok: true,
    message: 'debug route reached',
    body: req.body
  });
});

module.exports = router;
