// Ini adalah Netlify Function Anda.
// Kode ini akan berjalan di server, bukan di browser.
// API Keys Anda akan aman di sini.

exports.handler = async (event, context) => {
  // Hanya izinkan request POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. Ambil data dari request yang dikirim oleh index.html
    const clientData = JSON.parse(event.body);
    const { type, prompt, model, image } = clientData;

    // 2. Ambil API keys dari Netlify Environment Variables (lebih aman)
    const apiKeysString = process.env.GEMINI_API_KEYS;
    if (!apiKeysString) {
      throw new Error("GEMINI_API_KEYS environment variable not set.");
    }
    const API_KEYS = apiKeysString.split(',').map(key => key.trim());
    
    // Gunakan trik sederhana untuk memutar API key
    // Ini bukan solusi rotasi yang sempurna, tapi cukup untuk skala kecil.
    const apiKeyIndex = Math.floor(Math.random() * API_KEYS.length);
    const apiKey = API_KEYS[apiKeyIndex];

    // 3. Siapkan payload untuk dikirim ke Google API
    let googlePayload;
    if (type === 'generate' && image) {
      googlePayload = {
        contents: [{
          parts: [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }]
        }],
        generationConfig: { response_mime_type: "application/json" }
      };
    } else if (type === 'translate') {
      googlePayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      };
    } else {
      throw new Error("Invalid request type from client.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 4. Lakukan panggilan fetch ke Google API dari server Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googlePayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
        console.error("Error from Google API:", responseData);
        const errorMessage = responseData.error?.message || "An error occurred with the Google API.";
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: { message: errorMessage } }),
        };
    }

    // 5. Kirim kembali respons dari Google ke browser (index.html)
    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message || "An internal server error occurred." } }),
    };
  }
};
