
# AI-Powered Meeting Minutes Extractor

A Node.js backend service that processes meeting notes and automatically extracts structured information using OpenAI's GPT API.

## Features

- **Text Processing**: Accepts meeting notes via text input or file upload (.txt, .md)
- **AI-Powered Extraction**: Uses OpenAI GPT to extract:
  - Meeting summaries (2-3 sentences)
  - Key decisions made
  - Action items with tasks, owners, and deadlines
- **Flexible Input**: Supports both raw text in request body and file uploads
- **Structured Output**: Returns clean JSON with extracted information
- **Error Handling**: Comprehensive error handling for API timeouts, validation errors, and edge cases
- **Security**: Includes security headers, CORS configuration, and input validation

## Quick Start

### Prerequisites

- Node.js 16+ installed
- OpenAI API key (get one from https://platform.openai.com/api-keys)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-meeting-minutes-extractor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and configuration information.

### Process Meeting Notes
```
POST /process-meeting
```

Processes meeting notes and extracts structured information.

#### Input Options

**Option 1: Text in Request Body**
```json
{
  "text": "Your meeting notes here...",
  "extractionOptions": {
    "includeSummary": true,
    "includeDecisions": true,
    "includeActionItems": true,
    "maxSummaryLength": 3
  }
}
```

**Option 2: File Upload**
```bash
curl -X POST \
  -F "file=@meeting-notes.txt" \
  http://localhost:3000/process-meeting
```

## Usage Examples

### Using cURL

**Text input:**
```bash
curl -X POST http://localhost:3000/process-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Team meeting on June 1st. Decided to launch product on June 15th. John will prepare documentation by June 10th. Sarah to follow up with marketing team."
  }'
```

**File upload:**
```bash
curl -X POST http://localhost:3000/process-meeting \
  -F "file=@samples/meeting1.txt"
```

### Using Postman

1. **Text Input Method:**
   - Method: `POST`
   - URL: `http://localhost:3000/process-meeting`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "text": "Your meeting notes here..."
   }
   ```

2. **File Upload Method:**
   - Method: `POST`
   - URL: `http://localhost:3000/process-meeting`
   - Body: `form-data`
   - Key: `file` (type: File)
   - Value: Select your `.txt` or `.md` file

### Sample Response

```json
{
  "timestamp": "2024-06-05T14:30:00.000Z",
  "processed": true,
  "summary": "The team confirmed the product launch date for June 15th and assigned documentation preparation and marketing follow-up tasks.",
  "decisions": [
    "Launch product on June 15th",
    "Prioritize documentation completion"
  ],
  "actionItems": [
    {
      "task": "Prepare documentation",
      "owner": "John",
      "due": "June 10th"
    },
    {
      "task": "Follow up with marketing team",
      "owner": "Sarah",
      "due": null
    }
  ]
}
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `ALLOWED_ORIGINS` | CORS allowed origins | * |

### Extraction Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `includeSummary` | boolean | Include meeting summary | true |
| `includeDecisions` | boolean | Include key decisions | true |
| `includeActionItems` | boolean | Include action items | true |
| `maxSummaryLength` | number | Summary length in sentences (1-10) | 3 |

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test with Sample Files
```bash
# Test with sample meeting file
curl -X POST http://localhost:3000/process-meeting \
  -F "file=@samples/meeting1.txt"

# Test with second sample
curl -X POST http://localhost:3000/process-meeting \
  -F "file=@samples/meeting2.txt"
```

## Error Handling

The API includes comprehensive error handling for various scenarios:

- **Invalid input**: Missing or invalid text content
- **File upload errors**: Unsupported file types, size limits exceeded
- **AI service errors**: OpenAI API failures, rate limits, quota exceeded
- **Server errors**: Internal processing failures

### Common Error Responses

**Validation Error (400):**
```json
{
  "timestamp": "2024-06-05T14:30:00.000Z",
  "processed": false,
  "error": {
    "message": "Text content too short (minimum 10 characters)",
    "type": "ValidationError"
  }
}
```

**AI Service Error (503):**
```json
{
  "error": "AI service temporarily unavailable",
  "message": "Please try again in a few moments",
  "code": "AI_SERVICE_ERROR"
}
```

## Limitations

- Maximum file size: 10MB
- Maximum text length: 50,000 characters
- Minimum text length: 10 characters
- Supported file formats: `.txt`, `.md`
- Rate limit: 10 requests per 15 minutes per IP
- AI processing timeout: 30 seconds

## Security Features

- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Security headers via Helmet
- Input validation and sanitization
- Secure file upload handling
- Temporary file cleanup

## Troubleshooting

### Common Issues

1. **"OpenAI API is not properly configured"**
   - Ensure `OPENAI_API_KEY` is set in your `.env` file
   - Verify your API key is valid and has sufficient quota

2. **"File type not supported"**
   - Only `.txt` and `.md` files are accepted
   - Check file extension and content

3. **"Text content too short"**
   - Meeting notes must be at least 10 characters long
   - Ensure meaningful content is provided


## Development

### Project Structure
```
src/
├── controllers/     # Request handlers
├── services/       # Business logic (AI service)
├── middleware/     # Custom middleware
├── utils/          # Helper functions
├── config/         # Configuration files
└── app.js         # Express app setup
```


This comprehensive implementation provides:

1. **Complete project structure** with proper separation of concerns
2. **Robust API endpoints** with validation and error handling
3. **OpenAI integration** with retry logic and proper error handling
4. **File upload support** with security validation
5. **Comprehensive testing** setup
6. **Production-ready features** like rate limiting, security headers, and monitoring
7. **Detailed documentation** with examples and troubleshooting
8. **Sample files** for testing

The project follows Node.js best practices and is ready for deployment. You can start by setting up the environment and testing with the provided sample files.