// netlify/functions/gemini-api.js
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // API keys - tambahkan sebagai environment variables di Netlify
  const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    // Tambahkan lebih banyak keys sesuai kebutuhan
  ].filter(Boolean); // Remove undefined keys

  if (API_KEYS.length === 0) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'No API keys configured' })
    };
  }

  try {
    const { payload, model, apiKeyIndex = 0 } = JSON.parse(event.body);
    
    if (!payload || !model) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing payload or model' })
      };
    }

    const apiKey = API_KEYS[apiKeyIndex % API_KEYS.length];
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
