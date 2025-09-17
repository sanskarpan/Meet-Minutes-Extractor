const fs = require('fs-extra');

const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);

    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
        fs.remove(req.file.path).catch(console.error);
    }

    // OpenAI API errors
    if (err.name === 'OpenAIError' || err.message.includes('OpenAI')) {
        return res.status(503).json({
        error: 'AI service temporarily unavailable',
        message: 'Please try again in a few moments',
        code: 'AI_SERVICE_ERROR'
        });
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
        error: 'File too large',
        message: 'File size must be less than 10MB',
        code: 'FILE_TOO_LARGE'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
        error: 'Invalid file upload',
        message: 'Only one file is allowed',
        code: 'INVALID_FILE_UPLOAD'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
        error: 'Validation failed',
        message: err.message,
        code: 'VALIDATION_ERROR'
        });
    }

    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        error: isProduction ? 'Internal server error' : err.message,
        message: isProduction ? 'Something went wrong' : err.message,
        code: 'INTERNAL_ERROR',
        ...(isProduction ? {} : { stack: err.stack })
    });
};

module.exports = errorHandler;