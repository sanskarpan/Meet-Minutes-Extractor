const upload = require('../middleware/upload');
const { validateMeetingInput } = require('../middleware/validation');
const { readFileContent, cleanupFile, validateTextContent } = require('../utils/fileUtils');
const { formatResponse, formatErrorResponse } = require('../utils/responseFormatter');
const AIService = require('../services/aiService');

const processMeeting = [
    // File upload middleware 
    upload.single('file'),

    // Validation middleware
    validateMeetingInput,
    
    // Main processing function
    async (req, res) => {
        let filePath = null;
        
        try {
            // Get text content from either request body or uploaded file
            let textContent = req.validatedData.text;
            
            if (req.file) {
                filePath = req.file.path;
                textContent = await readFileContent(filePath);
            }

            // Validate text content
            const validatedText = validateTextContent(textContent);
            
            // Initialize AI service
            const aiService = new AIService();
            
            // Extract meeting minutes
            const extractionResult = await aiService.extractMeetingMinutes(
                validatedText,
                req.validatedData.extractionOptions
            );
            
            // Format and send response
            const response = formatResponse(extractionResult, req.validatedData.extractionOptions);
            
            res.json(response);
        
        } catch (error) {
            console.error('Meeting processing error:', error);
            
            const errorResponse = formatErrorResponse(error, {
                hasFile: !!req.file,
                textLength: req.validatedData.text?.length || 0
            });
            
            const statusCode = error.message.includes('validation') || 
                                error.message.includes('Invalid') ||
                                error.message.includes('too short') ||
                                error.message.includes('too long') ? 400 : 500;
            
            res.status(statusCode).json(errorResponse);
        
        } finally {
            // Cleanup uploaded file
            if (filePath) {
                await cleanupFile(filePath);
            }
        }
    }
];

module.exports = {
    processMeeting
};