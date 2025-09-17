const fs = require('fs-extra');
const path = require('path');

const readFileContent = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content.trim();
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
};

const cleanupFile = async (filePath) => {
    try {
        if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        }
    } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error.message);
    }
};

const validateTextContent = (text) => {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text content');
    }

    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
        throw new Error('Text content is empty');
    }

    if (trimmedText.length < 10) {
        throw new Error('Text content too short (minimum 10 characters)');
    }

    if (trimmedText.length > 50000) {
        throw new Error('Text content too long (maximum 50,000 characters)');
    }

    return trimmedText;
};

module.exports = {
    readFileContent,
    cleanupFile,
    validateTextContent
};