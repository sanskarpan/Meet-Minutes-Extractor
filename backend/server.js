const app = require('./src/app');
const config = require('./src/config/openai');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AI Meeting Minutes Extractor running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`OpenAI configured: ${config.openai ? 'True' : 'False'}`);
});