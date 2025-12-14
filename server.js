// server.js
const express = require('express');
const cors = require('cors');
// 1. ADD: Import the built-in 'path' module
const path = require('path'); 
// If you are using Node.js version < 18, you may need to install 'node-fetch'
const fetch = require('node-fetch'); 

const app = express();
// Render sets the PORT environment variable automatically
const port = process.env.PORT || 3000; 

// Load the API Key securely from the environment variable set in Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; 
const CHAT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// --- Middleware ---
// Allows front-end (browser) to make requests to this server
app.use(cors()); 
// Parses incoming JSON request bodies
app.use(express.json()); 

// NOTE: Since your index.html and assets are in the root, this line is likely incorrect:
// app.use(express.static('public')); 
// Instead, we will rely on the specific root route and serve files from the root directory:
app.use(express.static(__dirname)); // Serves static assets like suzi-profile.png from the root

// 2. FIX: Add the root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Secure Proxy Endpoint ---
app.post('/api/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing!");
        return res.status(500).json({ error: { message: "Server API Key not configured. Check Render environment variables." } });
    }
    
    try {
        const payload = req.body;
        
        // Forward the request to the Google Gemini API
        const response = await fetch(
            CHAT_API_URL,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();
        
        // Send the response (and status) received from Google back to the client
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: { message: "Internal server error during Gemini API call." } });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
