# Meeting Minutes Extractor

A full-stack application that automatically extracts structured information from meeting notes using OpenAI's GPT API. Features a dark terminal-style interface inspired by cyberpunk aesthetics.

![Terminal Interface](https://img.shields.io/badge/Interface-Terminal%20Style-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61dafb)
![AI](https://img.shields.io/badge/AI-OpenAI%20GPT-orange)

## Features

### Backend
- **AI-Powered Extraction**: Uses OpenAI GPT-3.5 to extract summaries, decisions, and action items
- **Dual Input Methods**: Supports both raw text and file uploads (.txt, .md)
- **Robust Error Handling**: Comprehensive error handling for API failures, validation, and edge cases
- **Security**: CORS configuration, rate limiting, input validation, and security headers
- **File Processing**: Secure file upload with type validation and automatic cleanup
- **Testing**: Complete test suite with 15+ tests covering all functionality

### Frontend
- **Dark Terminal Aesthetic**: Cyberpunk-inspired interface with green monospace text
- **Grid Background**: Subtle grid overlay for authentic terminal feel
- **Real-time Processing**: Live status updates and loading indicators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Styled Components**: Modern CSS-in-JS approach for maintainable styling

## Quick Start

### Prerequisites
- Node.js 16+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- npm or yarn package manager

### Easy Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/sanskarpan/Meet-Minutes-Extractor.git
cd Meet-Minutes-Extractor

# Run the development setup script
./start-dev.sh
```

The script will:
- Check dependencies and port availability
- Install packages if needed
- Create .env file from template
- Start both backend (port 3000) and frontend (port 3001)
- Provide helpful status updates

### Manual Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   npm start
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   PORT=3001 npm start
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## Usage

### Text Input Method
1. Paste your meeting notes in the text area
2. Click "Process Text"
3. View extracted summaries, decisions, and action items

### File Upload Method
1. Click "Choose File" and select a .txt or .md file
2. Click "Process File"
3. View the extracted results

### Sample Input
```
Team Sync – May 26, 2024

Discussion Points:
- We've decided to launch the new product on June 10th
- Beta users specifically requested a mobile-first dashboard
- Marketing team confirmed they're ready

Action Items:
- Ravi needs to prepare onboarding documentation by June 5th
- Priya will follow up with logistics team regarding packaging delays
```

### Sample Output
```json
{
  "summary": "The team confirmed the product launch for June 10th and discussed user feedback requesting mobile-first dashboard design.",
  "decisions": [
    "Launch date confirmed for June 10th",
    "Prioritize mobile dashboard development"
  ],
  "actionItems": [
    {
      "task": "Prepare onboarding documentation",
      "owner": "Ravi",
      "due": "June 5th"
    },
    {
      "task": "Follow up with logistics team regarding packaging delays",
      "owner": "Priya",
      "due": null
    }
  ]
}
```

## Architecture

```
┌──────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Frontend │ ──────────────► │ Express Backend │
│   (Port 3001)    │                 │   (Port 3000)   │
└──────────────────┘                 └─────────────────┘
                                            │
                                            │ API Calls
                                            ▼
                                    ┌─────────────────┐
                                    │   OpenAI API    │
                                    │   GPT-3.5       │
                                    └─────────────────┘
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Build Test
```bash
cd frontend
npm run build
```

## Project Structure

```
Meet-Minutes-Extractor/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic (AI service)
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Helper functions
│   │   └── config/          # Configuration files
│   ├── tests/               # Test files
│   ├── samples/             # Sample meeting files
│   └── uploads/             # Temporary file storage
├── frontend/                # React application
│   ├── src/
│   │   ├── App.js           # Main component
│   │   └── App.css          # Terminal-style CSS
│   └── public/              # Static assets
├── start-dev.sh             # Development setup script
└── README.md                # This file
```

## Configuration

### Backend Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend Configuration
- Runs on port 3001 by default
- Proxies API requests to backend on port 3000
- Responsive design adapts to screen size

## Design Philosophy

The interface is designed to match a cyberpunk/terminal aesthetic:

- **Color Scheme**: Dark background (#0a0a0a) with bright green text (#ff4d00)
- **Typography**: Monospace fonts (Courier New, JetBrains Mono, Fira Code)
- **Grid Pattern**: Subtle green grid overlay for depth
- **Glowing Effects**: Focus states with green glow effects
- **Terminal Elements**: Borders, panels, and status bars mimicking terminal interfaces
- **High Contrast**: Optimized for readability and accessibility

## Security Features

- **Input Validation**: Comprehensive validation using Joi
- **File Security**: Type validation and size limits for uploads
- **CORS Configuration**: Secure cross-origin resource sharing
- **Rate Limiting**: Protection against abuse (configurable)
- **Error Handling**: Secure error messages that don't expose internals
- **Environment Variables**: Sensitive data stored in environment variables

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and configuration information.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T15:20:32.357Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### Process Meeting Notes
```
POST /process-meeting
```

Processes meeting notes and extracts structured information using AI.

**Text Input**:
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

**File Upload**:
```bash
curl -X POST -F "file=@meeting.txt" http://localhost:3000/process-meeting
```

**Response**:
```json
{
  "timestamp": "2025-09-17T15:20:32.357Z",
  "processed": true,
  "summary": "Meeting summary here...",
  "decisions": ["Decision 1", "Decision 2"],
  "actionItems": [
    {
      "task": "Task description",
      "owner": "Person responsible",
      "due": "Deadline"
    }
  ]
}
```

**Error Response**:
```json
{
  "timestamp": "2025-09-17T15:20:32.357Z",
  "processed": false,
  "error": {
    "message": "Error description",
    "type": "ErrorType"
  }
}
```

### Supported File Types
- `.txt` files (plain text)
- `.md` files (Markdown)
- Maximum file size: 10MB
- Maximum text length: 50,000 characters

For complete API documentation, see [APIdocs.md](APIdocs.md).

## Documentation

### Complete Documentation
- **[APIdocs.md](APIdocs.md)** - Comprehensive API documentation with examples
- **[DesignDoc.md](DesignDoc.md)** - Complete system design and architecture documentation

### Component Documentation
- **[Backend README](backend/README.md)** - Backend setup, API details, and development guide
- **[Frontend README](frontend/README.md)** - Frontend setup, components, and styling guide

### Testing
- **Backend Tests**: 65 tests covering all API endpoints, middleware, and utilities
- **Frontend Tests**: 12 tests covering UI components and user interactions
- **Test Coverage**: Complete coverage of core functionality and edge cases

## Troubleshooting

### Common Issues

1. **"OpenAI API is not properly configured"**
   - Ensure `OPENAI_API_KEY` is set in `backend/.env`
   - Verify your API key is valid and has sufficient quota
   - Check that the key starts with `sk-`

2. **Port conflicts**
   - Backend runs on port 3000, frontend on 3001
   - Use `lsof -i :3000` to check if port is in use
   - Kill existing processes: `pkill -f "node.*server.js"`

3. **CORS errors**
   - Ensure `ALLOWED_ORIGINS` includes your frontend URL
   - Check that both servers are running
   - Verify frontend is accessing the correct backend URL

4. **File upload issues**
   - Only .txt and .md files are supported
   - Maximum file size is 10MB
   - Check file permissions and content encoding

5. **Tests failing**
   - Run `npm install` in both backend and frontend directories
   - Ensure all dependencies are installed
   - Check Node.js version (16+ required)

### Development Tips

- Use the `start-dev.sh` script for easy setup
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use the health endpoint to verify backend status: `curl http://localhost:3000/health`

### Getting Help

If you encounter issues:
1. Check the logs in both backend and frontend terminals
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check the OpenAI API status and your quota limits

