const OpenAI = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000, // 30 seconds
        maxRetries: 3,
    });
} else {
    console.warn('OPENAI_API_KEY not found in environment variables');
}

module.exports = {
    openai,
    isConfigured: () => !!openai
};