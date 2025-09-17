const { openai, isConfigured } = require('../config/openai');

class AIService {
    constructor() {
        if (!isConfigured()) {
        throw new Error('OpenAI API is not properly configured');
        }
    }

    async extractMeetingMinutes(text, options = {}) {
        const {
            maxSummaryLength = 3,
            includeSummary = true,
            includeDecisions = true,
            includeActionItems = true
        } = options;

        const prompt = this.buildPrompt(text, {
            maxSummaryLength,
            includeSummary,
            includeDecisions,
            includeActionItems
        });

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
            {
                role: 'system',
                content: 'You are a professional meeting minutes assistant. Extract information accurately and format it as valid JSON.'
            },
            {
                role: 'user',
                content: prompt
            }
            ],
            max_tokens: 1500,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const response = completion.choices[0].message.content;
            return this.parseAIResponse(response);
    } catch (error) {
    console.error('OpenAI API Error:', error);
        
        if (error.code === 'rate_limit_exceeded') {
            throw new Error('AI service rate limit exceeded. Please try again later.');
        }
        
        if (error.code === 'insufficient_quota') {
            throw new Error('AI service quota exceeded. Please contact administrator.');
        }
        
        throw new Error(`AI processing failed: ${error.message}`);
    }
    }

    buildPrompt(text, options) {
        const { maxSummaryLength, includeSummary, includeDecisions, includeActionItems } = options;
        
        let prompt = `Please analyze the following meeting notes and extract the requested information. Return the response as valid JSON with the following structure:

{`;

    if (includeSummary) {
        prompt += `
    "summary": "A ${maxSummaryLength} sentence summary of the meeting",`;
    }

    if (includeDecisions) {
        prompt += `
    "decisions": ["list of key decisions made"],`;
    }

    if (includeActionItems) {
        prompt += `
    "actionItems": [
    {
        "task": "description of the task",
        "owner": "person responsible (if mentioned, otherwise null)",
        "due": "deadline (if mentioned, otherwise null)"
    }
    ]`;
    }

    prompt += `
}

Meeting Notes:
${text}

Important guidelines:
- Extract information only from the provided text
- If no information is available for a section, use an empty array []
- For action items without clear owners or deadlines, use null
- Keep the summary concise and relevant
- Focus on concrete decisions and actionable items`;

    return prompt;
    }

    parseAIResponse(response) {
        try {
            const parsed = JSON.parse(response);
            
            // Validate the structure
            const result = {
                summary: parsed.summary || '',
                decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
                actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : []
            };

            // Validate action items structure
            result.actionItems = result.actionItems.map(item => ({
                task: item.task || '',
                owner: item.owner || null,
                due: item.due || item.deadline || null
            }));

            return result;
        } catch (error) {
            console.error('Failed to parse AI response:', response);
            throw new Error('Invalid AI response format');
        }
    }
}

module.exports = AIService;