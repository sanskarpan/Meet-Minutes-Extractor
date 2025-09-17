# API Documentation

## AI-Powered Meeting Minutes Extractor API

**Base URL**: `http://localhost:3000`  
**Version**: 1.0.0  
**Content-Type**: `application/json` (for text input) or `multipart/form-data` (for file upload)

---

## Authentication

Currently, no authentication is required. The API is designed for local development and testing.

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`  
**Description**: Returns the current status and configuration of the API server.

#### Request
```http
GET /health HTTP/1.1
Host: localhost:3000
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T15:20:32.357Z",
  "version": "1.0.0",
  "environment": "development"
}
```

#### Status Codes
- `200 OK`: Server is healthy and operational

---

### 2. Process Meeting Notes

**Endpoint**: `POST /process-meeting`  
**Description**: Processes meeting notes and extracts structured information using AI.

#### Method 1: Text Input

##### Request
```http
POST /process-meeting HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "text": "Team meeting on June 1st. Decided to launch product on June 15th. John will prepare documentation by June 10th. Sarah to follow up with marketing team.",
  "extractionOptions": {
    "includeSummary": true,
    "includeDecisions": true,
    "includeActionItems": true,
    "maxSummaryLength": 3
  }
}
```

##### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Meeting notes content (10-50,000 characters) |
| `extractionOptions` | object | No | Configuration for extraction behavior |

##### Extraction Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeSummary` | boolean | `true` | Include meeting summary in response |
| `includeDecisions` | boolean | `true` | Include key decisions in response |
| `includeActionItems` | boolean | `true` | Include action items in response |
| `maxSummaryLength` | integer | `3` | Summary length in sentences (1-10) |

#### Method 2: File Upload

##### Request
```http
POST /process-meeting HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="meeting.txt"
Content-Type: text/plain

[File content here]
--boundary--
```

##### File Requirements
- **Supported formats**: `.txt`, `.md`
- **Maximum size**: 10MB
- **Encoding**: UTF-8

#### Response (Success)

```json
{
  "timestamp": "2025-09-17T15:20:32.357Z",
  "processed": true,
  "summary": "The team decided to launch the product on June 15th. John is tasked with preparing documentation by June 10th, and Sarah will follow up with the marketing team.",
  "decisions": [
    "Launch product on June 15th"
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

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp of processing |
| `processed` | boolean | Always `true` for successful responses |
| `summary` | string | Meeting summary (if requested) |
| `decisions` | array | List of key decisions made |
| `actionItems` | array | List of action items with details |

##### Action Item Structure

| Field | Type | Description |
|-------|------|-------------|
| `task` | string | Description of the task |
| `owner` | string\|null | Person responsible (if mentioned) |
| `due` | string\|null | Deadline (if mentioned) |

#### Status Codes

- `200 OK`: Processing completed successfully
- `400 Bad Request`: Invalid input or validation error
- `413 Payload Too Large`: File size exceeds 10MB limit
- `500 Internal Server Error`: Server processing error
- `503 Service Unavailable`: AI service temporarily unavailable

---

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "\"text\" length must be at least 10 characters long",
      "value": "short"
    }
  ],
  "hint": "Provide either text in request body or upload a .txt/.md file"
}
```

### File Upload Error (413)
```json
{
  "error": "File too large",
  "message": "File size must be less than 10MB",
  "code": "FILE_TOO_LARGE"
}
```

### AI Service Error (503)
```json
{
  "error": "AI service temporarily unavailable",
  "message": "Please try again in a few moments",
  "code": "AI_SERVICE_ERROR"
}
```

### Rate Limit Error (429)
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

### Not Found Error (404)
```json
{
  "error": "Endpoint not found",
  "message": "Cannot GET /nonexistent",
  "availableEndpoints": [
    "GET /health",
    "POST /process-meeting"
  ]
}
```

---

## Rate Limiting (optional)

- **Window**: 15 minutes
- **Limit**: 10 requests per IP address
- **Status**: Currently disabled in development mode

---

## CORS Policy

The API supports cross-origin requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`

Additional origins can be configured via the `ALLOWED_ORIGINS` environment variable.

---

## Example Usage

### cURL Examples

#### Text Processing
```bash
curl -X POST http://localhost:3000/process-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Team meeting on June 1st. Decided to launch product on June 15th. John will prepare documentation by June 10th.",
    "extractionOptions": {
      "includeSummary": true,
      "includeDecisions": true,
      "includeActionItems": true,
      "maxSummaryLength": 2
    }
  }'
```

#### File Upload
```bash
curl -X POST http://localhost:3000/process-meeting \
  -F "file=@meeting-notes.txt"
```

#### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### JavaScript/Axios Examples

#### Text Processing
```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:3000/process-meeting', {
  text: 'Your meeting notes here...',
  extractionOptions: {
    includeSummary: true,
    includeDecisions: true,
    includeActionItems: true,
    maxSummaryLength: 3
  }
});

console.log(response.data);
```

#### File Upload
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await axios.post('http://localhost:3000/process-meeting', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

console.log(response.data);
```

### Python/Requests Examples

#### Text Processing
```python
import requests

url = "http://localhost:3000/process-meeting"
data = {
    "text": "Your meeting notes here...",
    "extractionOptions": {
        "includeSummary": True,
        "includeDecisions": True,
        "includeActionItems": True,
        "maxSummaryLength": 3
    }
}

response = requests.post(url, json=data)
print(response.json())
```

#### File Upload
```python
import requests

url = "http://localhost:3000/process-meeting"
files = {'file': open('meeting-notes.txt', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

---

## Limitations

- **Text Length**: 10 - 50,000 characters
- **File Size**: Maximum 10MB
- **File Types**: Only `.txt` and `.md` files
- **Processing Time**: Up to 30 seconds per request
- **Rate Limiting**: 10 requests per 15 minutes per IP (when enabled)
- **AI Model**: Currently uses GPT-3.5-turbo

---

## Environment Configuration

The API behavior can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |
| `RATE_LIMIT_WINDOW_MS` (optional) | Rate limit window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` (optional) | Max requests per window | `10` |

---

## Troubleshooting

### Common Issues

1. **"OpenAI API is not properly configured"**
   - Ensure `OPENAI_API_KEY` is set in environment variables
   - Verify API key is valid and has sufficient quota

2. **"Text content too short"**
   - Meeting notes must be at least 10 characters long
   - Ensure meaningful content is provided

3. **"File type not supported"**
   - Only `.txt` and `.md` files are accepted
   - Check file extension and MIME type

4. **CORS errors**
   - Ensure your origin is included in `ALLOWED_ORIGINS`
   - Check that the API server is running



