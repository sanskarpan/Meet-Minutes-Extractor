const request = require('supertest');
const app = require('../src/app');

describe('Meeting Processing API', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('environment');
        });
    });

    describe('POST /process-meeting', () => {
        it('should process meeting text successfully', async () => {
            const meetingText = "Team meeting on June 1st. Decided to launch product on June 15th. John will prepare documentation by June 10th. Sarah to follow up with marketing team.";
            
            const response = await request(app)
                .post('/process-meeting')
                .send({ text: meetingText })
                .expect(200);

            expect(response.body).toHaveProperty('processed', true);
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('decisions');
            expect(response.body).toHaveProperty('actionItems');
            expect(Array.isArray(response.body.decisions)).toBe(true);
            expect(Array.isArray(response.body.actionItems)).toBe(true);
        });

        it('should reject text that is too short', async () => {
            const response = await request(app)
                .post('/process-meeting')
                .send({ text: "short" })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body.details[0]).toHaveProperty('field', 'text');
        });

        it('should reject empty request', async () => {
            const response = await request(app)
                .post('/process-meeting')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });

        it('should handle extraction options', async () => {
            const meetingText = "Team meeting on June 1st. Decided to launch product on June 15th. John will prepare documentation by June 10th.";
            
            const response = await request(app)
                .post('/process-meeting')
                .send({ 
                    text: meetingText,
                    extractionOptions: {
                        includeSummary: false,
                        includeDecisions: true,
                        includeActionItems: true
                    }
                })
                .expect(200);

            expect(response.body).toHaveProperty('processed', true);
            expect(response.body).not.toHaveProperty('summary');
            expect(response.body).toHaveProperty('decisions');
            expect(response.body).toHaveProperty('actionItems');
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent endpoints', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Endpoint not found');
            expect(response.body).toHaveProperty('availableEndpoints');
        });
    });
});
