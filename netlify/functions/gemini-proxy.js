// This function acts as a secure proxy to the Google Gemini API.
// It reads your API keys from Netlify environment variables,
// so you don't have to expose them in the frontend HTML file.

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the API keys from the environment variables you set in Netlify.
    // The keys should be stored as a single string, separated by commas.
    const apiKeyString = process.env.GEMINI_API_KEYS;
    if (!apiKeyString) {
      throw new Error('GEMINI_API_KEYS environment variable not set.');
    }
    const apiKeys = apiKeyString.split(',').map(key => key.trim());
    if (apiKeys.length === 0) {
        throw new Error('GEMINI_API_KEYS is empty or invalid.');
    }

    // Randomly pick one key from the list to distribute the load.
    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    // Get the model and payload sent from the frontend.
    const { model, payload } = JSON.parse(event.body);
    if (!model || !payload) {
        return { statusCode: 400, body: 'Missing model or payload in request body.' };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google API Error:', errorBody);
      // Pass the error from Google back to the client for better debugging
      return { statusCode: response.status, body: JSON.stringify({ error: `Google API Error: ${errorBody}` }) };
    }

    const data = await response.json();

    // Return the successful response from Google back to the frontend.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
