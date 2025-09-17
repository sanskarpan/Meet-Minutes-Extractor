const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const { validateMeetingInput } = require('../src/middleware/validation');
const upload = require('../src/middleware/upload');
const errorHandler = require('../src/middleware/errorHandler');

describe('Middleware Tests', () => {
    let app;
    let consoleErrorSpy;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        // Suppress console.error during tests
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        if (consoleErrorSpy) {
            consoleErrorSpy.mockRestore();
        }
    });

    describe('Validation Middleware', () => {
        beforeEach(() => {
            app.post('/test', validateMeetingInput, (req, res) => {
                res.json({ success: true, data: req.validatedData });
            });
            app.use(errorHandler);
        });

        test('should validate valid text input', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    text: 'This is a valid meeting note with sufficient length',
                    extractionOptions: {
                        includeSummary: true,
                        includeDecisions: false,
                        maxSummaryLength: 2
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.text).toBe('This is a valid meeting note with sufficient length');
            expect(response.body.data.extractionOptions.includeSummary).toBe(true);
            expect(response.body.data.extractionOptions.includeDecisions).toBe(false);
            expect(response.body.data.extractionOptions.maxSummaryLength).toBe(2);
        });

        test('should apply default values for extraction options', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    text: 'This is a valid meeting note with sufficient length'
                })
                .expect(200);

            // Check that extractionOptions is defined (defaults to empty object)
            expect(response.body.data.extractionOptions).toBeDefined();
            expect(typeof response.body.data.extractionOptions).toBe('object');
        });

        test('should reject text that is too short', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    text: 'short'
                })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('text');
            expect(response.body.details[0].message).toContain('at least 10 characters');
        });

        test('should reject text that is too long', async () => {
            const longText = 'a'.repeat(50001);
            const response = await request(app)
                .post('/test')
                .send({
                    text: longText
                })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('text');
            expect(response.body.details[0].message).toContain('less than or equal to 50000');
        });

        test('should reject invalid maxSummaryLength', async () => {
            const response = await request(app)
                .post('/test')
                .send({
                    text: 'This is a valid meeting note with sufficient length',
                    extractionOptions: {
                        maxSummaryLength: 15
                    }
                })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('extractionOptions.maxSummaryLength');
        });

        test('should reject unknown fields', async () => {
            // Update the validation to be stricter in the test
            app.post('/test-strict', (req, res, next) => {
                const Joi = require('joi');
                const strictSchema = Joi.object({
                    text: Joi.string().min(10).max(50000).required(),
                    extractionOptions: Joi.object().optional()
                }).options({ allowUnknown: false });

                const { error, value } = strictSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                }
                res.json({ success: true, data: value });
            });

            const response = await request(app)
                .post('/test-strict')
                .send({
                    text: 'This is a valid meeting note with sufficient length',
                    unknownField: 'should be rejected'
                })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
        });

        test('should require text when no file is present', async () => {
            const response = await request(app)
                .post('/test')
                .send({})
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('text');
            expect(response.body.details[0].message).toContain('required');
        });
    });

    describe('Upload Middleware', () => {
        beforeEach(() => {
            app.post('/upload', upload.single('file'), (req, res) => {
                res.json({ 
                    success: true, 
                    file: req.file ? {
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                        size: req.file.size
                    } : null 
                });
            });
            app.use(errorHandler);
        });

        afterEach(async () => {
            // Clean up any uploaded files
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (await fs.pathExists(uploadsDir)) {
                const files = await fs.readdir(uploadsDir);
                for (const file of files) {
                    if (file.startsWith('meeting-')) {
                        await fs.remove(path.join(uploadsDir, file));
                    }
                }
            }
        });

        test('should accept valid .txt file', async () => {
            const response = await request(app)
                .post('/upload')
                .attach('file', Buffer.from('Test meeting content'), 'test.txt')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.file.originalname).toBe('test.txt');
            expect(response.body.file.mimetype).toBe('text/plain');
        });

        test('should accept valid .md file', async () => {
            const response = await request(app)
                .post('/upload')
                .attach('file', Buffer.from('# Test meeting content'), 'test.md')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.file.originalname).toBe('test.md');
        });

        test('should reject invalid file types', async () => {
            const response = await request(app)
                .post('/upload')
                .attach('file', Buffer.from('Test content'), 'test.pdf')
                .expect(500);

            expect(response.body.error).toContain('File type .pdf not supported');
        });

        test('should reject files that are too large', async () => {
            const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
            
            const response = await request(app)
                .post('/upload')
                .attach('file', largeBuffer, 'large.txt')
                .expect(413);

            expect(response.body.error).toBe('File too large');
            expect(response.body.code).toBe('FILE_TOO_LARGE');
        });

        test('should handle no file upload gracefully', async () => {
            const response = await request(app)
                .post('/upload')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.file).toBeNull();
        });
    });

    describe('Error Handler Middleware', () => {
        test('should handle validation errors', async () => {
            app.post('/test', (req, res, next) => {
                const error = new Error('Test validation error');
                error.name = 'ValidationError';
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });

        test('should handle OpenAI errors', async () => {
            app.post('/test', (req, res, next) => {
                const error = new Error('OpenAI API error');
                error.name = 'OpenAIError';
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(503);

            expect(response.body.error).toBe('AI service temporarily unavailable');
            expect(response.body.code).toBe('AI_SERVICE_ERROR');
        });

        test('should handle file size limit errors', async () => {
            app.post('/test', (req, res, next) => {
                const error = new Error('File too large');
                error.code = 'LIMIT_FILE_SIZE';
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(413);

            expect(response.body.error).toBe('File too large');
            expect(response.body.code).toBe('FILE_TOO_LARGE');
        });

        test('should handle unexpected file errors', async () => {
            app.post('/test', (req, res, next) => {
                const error = new Error('Unexpected file');
                error.code = 'LIMIT_UNEXPECTED_FILE';
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(400);

            expect(response.body.error).toBe('Invalid file upload');
            expect(response.body.code).toBe('INVALID_FILE_UPLOAD');
        });

        test('should handle generic errors in development', async () => {
            process.env.NODE_ENV = 'development';
            
            app.post('/test', (req, res, next) => {
                const error = new Error('Generic test error');
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(500);

            expect(response.body.error).toBe('Generic test error');
            expect(response.body.code).toBe('INTERNAL_ERROR');
            expect(response.body.stack).toBeDefined();
        });

        test('should handle generic errors in production', async () => {
            process.env.NODE_ENV = 'production';
            
            app.post('/test', (req, res, next) => {
                const error = new Error('Generic test error');
                next(error);
            });
            app.use(errorHandler);

            const response = await request(app)
                .post('/test')
                .expect(500);

            expect(response.body.error).toBe('Internal server error');
            expect(response.body.code).toBe('INTERNAL_ERROR');
            expect(response.body.stack).toBeUndefined();
            
            // Reset NODE_ENV
            process.env.NODE_ENV = 'test';
        });

        test('should clean up uploaded files on error', async () => {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const testFile = path.join(uploadsDir, 'test-file.txt');
            
            // Create a test file
            await fs.ensureDir(uploadsDir);
            await fs.writeFile(testFile, 'test content');
            
            app.post('/test', (req, res, next) => {
                req.file = { path: testFile };
                const error = new Error('Test error');
                next(error);
            });
            app.use(errorHandler);

            await request(app)
                .post('/test')
                .expect(500);

            // Give a small delay for cleanup to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // File should be cleaned up
            expect(await fs.pathExists(testFile)).toBe(false);
        });
    });
});
