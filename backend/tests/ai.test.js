const AIService = require('../src/services/aiService');

// Mock OpenAI to avoid making real API calls during tests
jest.mock('../src/config/openai', () => ({
    openai: {
        chat: {
            completions: {
                create: jest.fn()
            }
        }
    },
    isConfigured: () => true
}));

const { openai } = require('../src/config/openai');

describe('AIService', () => {
    let aiService;
    let consoleErrorSpy;

    beforeEach(() => {
        aiService = new AIService();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('extractMeetingMinutes', () => {
        it('should extract meeting minutes successfully', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            summary: "Test meeting summary",
                            decisions: ["Decision 1", "Decision 2"],
                            actionItems: [
                                { task: "Task 1", owner: "John", due: "Tomorrow" },
                                { task: "Task 2", owner: "Jane", due: null }
                            ]
                        })
                    }
                }]
            };

            openai.chat.completions.create.mockResolvedValue(mockResponse);

            const result = await aiService.extractMeetingMinutes("Test meeting content");

            expect(result).toHaveProperty('summary', 'Test meeting summary');
            expect(result).toHaveProperty('decisions');
            expect(result).toHaveProperty('actionItems');
            expect(result.decisions).toHaveLength(2);
            expect(result.actionItems).toHaveLength(2);
            expect(result.actionItems[0]).toHaveProperty('task', 'Task 1');
            expect(result.actionItems[0]).toHaveProperty('owner', 'John');
            expect(result.actionItems[0]).toHaveProperty('due', 'Tomorrow');
        });

        it('should handle OpenAI API errors', async () => {
            openai.chat.completions.create.mockRejectedValue(new Error('API Error'));

            await expect(aiService.extractMeetingMinutes("Test content"))
                .rejects.toThrow('AI processing failed: API Error');
        });

        it('should handle rate limit errors', async () => {
            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.code = 'rate_limit_exceeded';
            openai.chat.completions.create.mockRejectedValue(rateLimitError);

            await expect(aiService.extractMeetingMinutes("Test content"))
                .rejects.toThrow('AI service rate limit exceeded. Please try again later.');
        });

        it('should handle quota exceeded errors', async () => {
            const quotaError = new Error('Quota exceeded');
            quotaError.code = 'insufficient_quota';
            openai.chat.completions.create.mockRejectedValue(quotaError);

            await expect(aiService.extractMeetingMinutes("Test content"))
                .rejects.toThrow('AI service quota exceeded. Please contact administrator.');
        });
    });

    describe('parseAIResponse', () => {
        it('should parse valid JSON response', () => {
            const validResponse = JSON.stringify({
                summary: "Test summary",
                decisions: ["Decision 1"],
                actionItems: [{ task: "Task 1", owner: "John", due: "Tomorrow" }]
            });

            const result = aiService.parseAIResponse(validResponse);

            expect(result).toHaveProperty('summary', 'Test summary');
            expect(result.decisions).toHaveLength(1);
            expect(result.actionItems).toHaveLength(1);
        });

        it('should handle invalid JSON response', () => {
            const invalidResponse = "Invalid JSON";

            expect(() => aiService.parseAIResponse(invalidResponse))
                .toThrow('Invalid AI response format');
        });

        it('should handle missing fields in response', () => {
            const partialResponse = JSON.stringify({
                summary: "Test summary"
                // Missing decisions and actionItems
            });

            const result = aiService.parseAIResponse(partialResponse);

            expect(result).toHaveProperty('summary', 'Test summary');
            expect(result.decisions).toEqual([]);
            expect(result.actionItems).toEqual([]);
        });
    });

    describe('buildPrompt', () => {
        it('should build prompt with all options enabled', () => {
            const text = "Test meeting content";
            const options = {
                maxSummaryLength: 3,
                includeSummary: true,
                includeDecisions: true,
                includeActionItems: true
            };

            const prompt = aiService.buildPrompt(text, options);

            expect(prompt).toContain('summary');
            expect(prompt).toContain('decisions');
            expect(prompt).toContain('actionItems');
            expect(prompt).toContain(text);
        });

        it('should build prompt with only summary enabled', () => {
            const text = "Test meeting content";
            const options = {
                maxSummaryLength: 2,
                includeSummary: true,
                includeDecisions: false,
                includeActionItems: false
            };

            const prompt = aiService.buildPrompt(text, options);

            expect(prompt).toContain('summary');
            expect(prompt).not.toContain('decisions');
            expect(prompt).not.toContain('actionItems');
        });
    });
});
