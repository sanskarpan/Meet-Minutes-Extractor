const formatResponse = (aiResponse, extractionOptions = {}) => {
    const response = {
        timestamp: new Date().toISOString(),
        processed: true
    };

    // Add summary if requested
    if (extractionOptions.includeSummary !== false && aiResponse.summary) {
        response.summary = aiResponse.summary;
    }

    // Add decisions if requested
    if (extractionOptions.includeDecisions !== false && aiResponse.decisions) {
        response.decisions = Array.isArray(aiResponse.decisions) 
        ? aiResponse.decisions 
        : [];
    }

    // Add action items if requested
    if (extractionOptions.includeActionItems !== false && aiResponse.actionItems) {
        response.actionItems = Array.isArray(aiResponse.actionItems)
        ? aiResponse.actionItems.map(item => ({
            task: item.task || '',
            owner: item.owner || null,
            due: item.due || item.deadline || null
            }))
        : [];
    }
    
    return response;
};
    
const formatErrorResponse = (error, context = {}) => {
        return {
        timestamp: new Date().toISOString(),
        processed: false,
        error: {
            message: error.message,
            type: error.name || 'ProcessingError',
            context: context
        }
    };
};

module.exports = {
    formatResponse,
    formatErrorResponse
};