const fs = require('fs-extra');
const path = require('path');
const { readFileContent, cleanupFile, validateTextContent } = require('../src/utils/fileUtils');
const { formatResponse, formatErrorResponse } = require('../src/utils/responseFormatter');

describe('Utils Tests', () => {
    const testDir = path.join(__dirname, 'temp');
    
    beforeAll(async () => {
        await fs.ensureDir(testDir);
    });

    afterAll(async () => {
        await fs.remove(testDir);
    });

    describe('File Utils', () => {
        describe('readFileContent', () => {
            test('should read file content successfully', async () => {
                const testFile = path.join(testDir, 'test.txt');
                const content = 'Test file content\nWith multiple lines';
                await fs.writeFile(testFile, content);

                const result = await readFileContent(testFile);
                expect(result).toBe(content);

                await fs.remove(testFile);
            });

            test('should trim whitespace from file content', async () => {
                const testFile = path.join(testDir, 'test-whitespace.txt');
                const content = '  \n  Test content with whitespace  \n  ';
                await fs.writeFile(testFile, content);

                const result = await readFileContent(testFile);
                expect(result).toBe('Test content with whitespace');

                await fs.remove(testFile);
            });

            test('should throw error for non-existent file', async () => {
                const nonExistentFile = path.join(testDir, 'non-existent.txt');
                
                await expect(readFileContent(nonExistentFile))
                    .rejects.toThrow('Failed to read file');
            });

            test('should handle empty files', async () => {
                const testFile = path.join(testDir, 'empty.txt');
                await fs.writeFile(testFile, '');

                const result = await readFileContent(testFile);
                expect(result).toBe('');

                await fs.remove(testFile);
            });
        });

        describe('cleanupFile', () => {
            test('should remove existing file', async () => {
                const testFile = path.join(testDir, 'cleanup-test.txt');
                await fs.writeFile(testFile, 'test content');

                expect(await fs.pathExists(testFile)).toBe(true);
                
                await cleanupFile(testFile);
                
                expect(await fs.pathExists(testFile)).toBe(false);
            });

            test('should handle non-existent file gracefully', async () => {
                const nonExistentFile = path.join(testDir, 'non-existent-cleanup.txt');
                
                // Should not throw error
                await expect(cleanupFile(nonExistentFile)).resolves.toBeUndefined();
            });

            test('should handle permission errors gracefully', async () => {
                // Create a file and make it read-only (simulate permission error)
                const testFile = path.join(testDir, 'readonly.txt');
                await fs.writeFile(testFile, 'test content');
                
                // Mock fs.remove to throw an error
                const originalRemove = fs.remove;
                fs.remove = jest.fn().mockRejectedValue(new Error('Permission denied'));
                
                // Should not throw error, just log warning
                await expect(cleanupFile(testFile)).resolves.toBeUndefined();
                
                // Restore original function
                fs.remove = originalRemove;
                
                // Clean up
                await fs.remove(testFile);
            });
        });

        describe('validateTextContent', () => {
            test('should validate valid text content', () => {
                const validText = 'This is a valid meeting note with sufficient length';
                const result = validateTextContent(validText);
                expect(result).toBe(validText);
            });

            test('should trim whitespace and validate', () => {
                const textWithWhitespace = '  \n  Valid meeting content  \n  ';
                const result = validateTextContent(textWithWhitespace);
                expect(result).toBe('Valid meeting content');
            });

            test('should throw error for null text', () => {
                expect(() => validateTextContent(null))
                    .toThrow('Invalid text content');
            });

            test('should throw error for undefined text', () => {
                expect(() => validateTextContent(undefined))
                    .toThrow('Invalid text content');
            });

            test('should throw error for non-string text', () => {
                expect(() => validateTextContent(123))
                    .toThrow('Invalid text content');
                
                expect(() => validateTextContent({}))
                    .toThrow('Invalid text content');
                
                expect(() => validateTextContent([]))
                    .toThrow('Invalid text content');
            });

        test('should throw error for empty text', () => {
            expect(() => validateTextContent(''))
                .toThrow('Invalid text content');
            
            expect(() => validateTextContent('   \n   '))
                .toThrow('Text content is empty');
        });

            test('should throw error for text that is too short', () => {
                expect(() => validateTextContent('short'))
                    .toThrow('Text content too short (minimum 10 characters)');
            });

            test('should throw error for text that is too long', () => {
                const longText = 'a'.repeat(50001);
                expect(() => validateTextContent(longText))
                    .toThrow('Text content too long (maximum 50,000 characters)');
            });

            test('should accept text at minimum length', () => {
                const minText = 'a'.repeat(10);
                const result = validateTextContent(minText);
                expect(result).toBe(minText);
            });

            test('should accept text at maximum length', () => {
                const maxText = 'a'.repeat(50000);
                const result = validateTextContent(maxText);
                expect(result).toBe(maxText);
            });
        });
    });

    describe('Response Formatter', () => {
        describe('formatResponse', () => {
            test('should format complete response with all fields', () => {
                const aiResponse = {
                    summary: 'Test meeting summary',
                    decisions: ['Decision 1', 'Decision 2'],
                    actionItems: [
                        { task: 'Task 1', owner: 'John', due: 'Tomorrow' },
                        { task: 'Task 2', owner: 'Jane', deadline: 'Next week' }
                    ]
                };

                const result = formatResponse(aiResponse);

                expect(result).toHaveProperty('timestamp');
                expect(result).toHaveProperty('processed', true);
                expect(result).toHaveProperty('summary', 'Test meeting summary');
                expect(result).toHaveProperty('decisions', ['Decision 1', 'Decision 2']);
                expect(result.actionItems).toHaveLength(2);
                expect(result.actionItems[0]).toEqual({
                    task: 'Task 1',
                    owner: 'John',
                    due: 'Tomorrow'
                });
                expect(result.actionItems[1]).toEqual({
                    task: 'Task 2',
                    owner: 'Jane',
                    due: 'Next week'
                });
            });

            test('should handle extraction options to exclude fields', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: ['Decision 1'],
                    actionItems: [{ task: 'Task 1', owner: 'John', due: null }]
                };

                const extractionOptions = {
                    includeSummary: false,
                    includeDecisions: true,
                    includeActionItems: false
                };

                const result = formatResponse(aiResponse, extractionOptions);

                expect(result).not.toHaveProperty('summary');
                expect(result).toHaveProperty('decisions');
                expect(result).not.toHaveProperty('actionItems');
            });

            test('should handle empty arrays', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: [],
                    actionItems: []
                };

                const result = formatResponse(aiResponse);

                expect(result.decisions).toEqual([]);
                expect(result.actionItems).toEqual([]);
            });

            test('should handle missing fields in AI response', () => {
                const aiResponse = {
                    summary: 'Test summary'
                    // Missing decisions and actionItems
                };

                const result = formatResponse(aiResponse);

                expect(result).toHaveProperty('summary', 'Test summary');
                expect(result).not.toHaveProperty('decisions');
                expect(result).not.toHaveProperty('actionItems');
            });

            test('should handle non-array decisions and actionItems', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: 'Not an array',
                    actionItems: 'Also not an array'
                };

                const result = formatResponse(aiResponse);

                expect(result.decisions).toEqual([]);
                expect(result.actionItems).toEqual([]);
            });

            test('should handle action items with missing fields', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: [],
                    actionItems: [
                        { task: 'Complete task' }, // Missing owner and due
                        { owner: 'John' }, // Missing task and due
                        {} // Missing all fields
                    ]
                };

                const result = formatResponse(aiResponse);

                expect(result.actionItems).toEqual([
                    { task: 'Complete task', owner: null, due: null },
                    { task: '', owner: 'John', due: null },
                    { task: '', owner: null, due: null }
                ]);
            });

            test('should prefer "due" over "deadline" field', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: [],
                    actionItems: [
                        { task: 'Task 1', owner: 'John', due: 'Tomorrow', deadline: 'Next week' }
                    ]
                };

                const result = formatResponse(aiResponse);

                expect(result.actionItems[0].due).toBe('Tomorrow');
            });

            test('should use "deadline" when "due" is not present', () => {
                const aiResponse = {
                    summary: 'Test summary',
                    decisions: [],
                    actionItems: [
                        { task: 'Task 1', owner: 'John', deadline: 'Next week' }
                    ]
                };

                const result = formatResponse(aiResponse);

                expect(result.actionItems[0].due).toBe('Next week');
            });
        });

        describe('formatErrorResponse', () => {
            test('should format basic error response', () => {
                const error = new Error('Test error message');
                const result = formatErrorResponse(error);

                expect(result).toHaveProperty('timestamp');
                expect(result).toHaveProperty('processed', false);
                expect(result.error).toEqual({
                    message: 'Test error message',
                    type: 'Error',
                    context: {}
                });
            });

            test('should include error context', () => {
                const error = new Error('Validation failed');
                const context = { hasFile: true, textLength: 100 };
                const result = formatErrorResponse(error, context);

                expect(result.error.context).toEqual(context);
            });

            test('should handle custom error types', () => {
                const error = new Error('Custom error');
                error.name = 'CustomError';
                const result = formatErrorResponse(error);

                expect(result.error.type).toBe('CustomError');
            });

        test('should handle errors without names', () => {
            const error = new Error('Unnamed error');
            delete error.name;
            const result = formatErrorResponse(error);

            expect(result.error.type).toBe('Error');
        });

            test('should handle empty context', () => {
                const error = new Error('Test error');
                const result = formatErrorResponse(error, {});

                expect(result.error.context).toEqual({});
            });

            test('should handle undefined context', () => {
                const error = new Error('Test error');
                const result = formatErrorResponse(error);

                expect(result.error.context).toEqual({});
            });
        });
    });
});
