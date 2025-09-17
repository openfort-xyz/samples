const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Openfort Backend Server Running',
    features: ['encryption-sessions', 'shield-api-integration']
  });
});

// Create encryption session endpoint
app.post('/api/create-encryption-session', async (req, res) => {
  try {
    const response = await fetch(`https://shield.openfort.io/project/encryption-session`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_SHIELD_API_KEY,
        "x-api-secret": process.env.NEXTAUTH_SHIELD_SECRET_KEY,
      },
      method: "POST",
      body: JSON.stringify({
        encryption_part: process.env.NEXTAUTH_SHIELD_ENCRYPTION_SHARE,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Shield API error: ${response.status} - ${errorText}`);
      throw new Error(`Shield API error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log(`✅ Encryption session created successfully: ${jsonResponse.session_id}`);

    res.status(200).json({
      success: true,
      session: jsonResponse.session_id,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'shield.openfort.io'
      }
    });

  } catch (error) {
    console.error('❌ Error creating encryption session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Openfort Backend Server running on port ${PORT}`);
  console.log(`📱 Frontend origin: ${process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🔑 Shield API Key: ${process.env.NEXT_PUBLIC_SHIELD_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔐 Shield Secret Key: ${process.env.NEXTAUTH_SHIELD_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔓 Encryption Share: ${process.env.NEXTAUTH_SHIELD_ENCRYPTION_SHARE ? '✅ Configured' : '❌ Missing'}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Encryption session endpoint: http://localhost:${PORT}/api/create-encryption-session`);
}); 