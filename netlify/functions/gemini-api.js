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
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
    process.env.GEMINI_API_KEY_11,
    process.env.GEMINI_API_KEY_12,
    process.env.GEMINI_API_KEY_13,
    process.env.GEMINI_API_KEY_14,
    process.env.GEMINI_API_KEY_15,
    process.env.GEMINI_API_KEY_16,
    process.env.GEMINI_API_KEY_17,
    process.env.GEMINI_API_KEY_18,
    process.env.GEMINI_API_KEY_19,
    process.env.GEMINI_API_KEY_20,
    process.env.GEMINI_API_KEY_21,
    process.env.GEMINI_API_KEY_22,
    process.env.GEMINI_API_KEY_23,
    process.env.GEMINI_API_KEY_24,
    process.env.GEMINI_API_KEY_25,
    process.env.GEMINI_API_KEY_26,
    process.env.GEMINI_API_KEY_27,
    process.env.GEMINI_API_KEY_28,
    process.env.GEMINI_API_KEY_29,
    process.env.GEMINI_API_KEY_30,
    process.env.GEMINI_API_KEY_31,
    process.env.GEMINI_API_KEY_32,
    process.env.GEMINI_API_KEY_33,
    process.env.GEMINI_API_KEY_34,
    process.env.GEMINI_API_KEY_35,
    process.env.GEMINI_API_KEY_36,
    process.env.GEMINI_API_KEY_37,
    process.env.GEMINI_API_KEY_38,
    process.env.GEMINI_API_KEY_39,
    process.env.GEMINI_API_KEY_40,
    process.env.GEMINI_API_KEY_41,
    process.env.GEMINI_API_KEY_42,
    process.env.GEMINI_API_KEY_43,
    process.env.GEMINI_API_KEY_44,
    process.env.GEMINI_API_KEY_45,
    process.env.GEMINI_API_KEY_46,
    process.env.GEMINI_API_KEY_47,
    process.env.GEMINI_API_KEY_48,
    process.env.GEMINI_API_KEY_49,
    process.env.GEMINI_API_KEY_50,
    process.env.GEMINI_API_KEY_51,
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
