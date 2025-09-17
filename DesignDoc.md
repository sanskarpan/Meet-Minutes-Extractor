# Design Document: AI-Powered Meeting Minutes Extractor

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Design](#backend-design)
4. [Frontend Design](#frontend-design)
5. [Data Flow](#data-flow)
6. [Security Design](#security-design)
7. [Performance Considerations](#performance-considerations)
8. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

### Purpose
The AI-Powered Meeting Minutes Extractor is a full-stack web application that automatically processes meeting notes and extracts structured information using OpenAI's GPT API. It provides users with summaries, key decisions, and action items from unstructured meeting text.

### Goals
- **Automation**: Reduce manual effort in creating structured meeting minutes
- **Accuracy**: Leverage AI to identify key information with high precision
- **Usability**: Provide an intuitive interface for both technical and non-technical users
- **Flexibility**: Support multiple input methods (text and file upload)
- **Reliability**: Ensure robust error handling and graceful degradation

### Target Users
- Project managers and team leads
- Administrative assistants
- Meeting organizers
- Anyone who needs to process meeting notes regularly

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (Port 3001)                                 │
│  - Terminal-style UI                                        │
│  - File upload & text input                                 │
│  - Real-time status updates                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ (CORS enabled)
┌─────────────────▼───────────────────────────────────────────┐
│                Application Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Express.js Backend (Port 3000)                             │
│  - API endpoints                                            │ 
│  - Request validation                                       │
│  - File handling                                            │
│  - Error management                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP API Calls
                  │ (Rate limited)
┌─────────────────▼───────────────────────────────────────────┐
│                External Services                            │
├─────────────────────────────────────────────────────────────┤
│  OpenAI GPT-3.5-turbo API                                   │
│  - Text processing                                          │
│  - JSON response formatting                                 │
│  - Rate limiting & quota management                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.1.1
- Styled Components 6.1.19
- Axios 1.12.2
- Modern JavaScript (ES6+)

**Backend:**
- Node.js 16+
- Express.js 4.18.2
- OpenAI SDK 4.20.1
- Multer (file uploads)
- Joi (validation)
- Jest (testing)

**External Services:**
- OpenAI GPT-3.5-turbo API

---

## Backend Design

### Architecture Pattern
The backend follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           Controllers Layer             │
│  - meetingController.js                 │
│  - Request/Response handling            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Middleware Layer              │
│  - validation.js                        │
│  - upload.js                            │
│  - errorHandler.js                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Services Layer                │
│  - aiService.js                         │
│  - Business logic                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Utils Layer                   │
│  - fileUtils.js                         │
│  - responseFormatter.js                 │
└─────────────────────────────────────────┘
```

### Key Components

#### 1. Controllers (`/controllers`)
- **meetingController.js**: Handles HTTP requests for meeting processing
- Orchestrates the request flow through middleware and services
- Manages file cleanup and error responses

#### 2. Middleware (`/middleware`)
- **validation.js**: Joi-based input validation
- **upload.js**: Multer configuration for file uploads
- **errorHandler.js**: Global error handling and logging

#### 3. Services (`/services`)
- **aiService.js**: OpenAI API integration and prompt engineering
- Handles AI response parsing and validation
- Implements retry logic and error handling

#### 4. Utils (`/utils`)
- **fileUtils.js**: File reading, validation, and cleanup
- **responseFormatter.js**: Standardized API response formatting

#### 5. Configuration (`/config`)
- **openai.js**: OpenAI client configuration and initialization

### API Design Principles

1. **RESTful Design**: Clear, predictable endpoints
2. **Stateless**: No server-side session management
3. **Idempotent**: Safe to retry requests
4. **Consistent Responses**: Standardized JSON format
5. **Error Transparency**: Clear error messages and codes

### Data Validation

```javascript
// Input validation schema
const meetingSchema = Joi.object({
    text: Joi.string().min(10).max(50000),
    file: Joi.object().optional(),
    extractionOptions: Joi.object({
        includeSummary: Joi.boolean().default(true),
        includeDecisions: Joi.boolean().default(true),
        includeActionItems: Joi.boolean().default(true),
        maxSummaryLength: Joi.number().integer().min(1).max(10).default(3)
    }).default({})
});
```

### Error Handling Strategy

1. **Validation Errors** (400): Client-side input issues
2. **Authentication Errors** (401): API key problems
3. **Rate Limit Errors** (429): Too many requests
4. **Server Errors** (500): Internal processing failures
5. **Service Errors** (503): External API unavailable

---

## Frontend Design

### Architecture Pattern
The frontend uses a **component-based architecture** with React hooks for state management:

```
┌─────────────────────────────────────────┐
│              App Component              │
│  - Main application logic               │
│  - State management                     │
│  - API communication                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Styled Components             │
│  - AppContainer                         │
│  - Header, Panel, Button                │
│  - Terminal-style theming               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              CSS Styling                │
│  - App.css (global styles)              │
│  - Terminal aesthetic                   │
│  - Responsive design                    │
└─────────────────────────────────────────┘
```

### Design System

#### Color Palette
- **Primary**: `#ff4d00` (Orange-red)
- **Background**: `#0a0a0a` (Near black)
- **Secondary**: `#333` (Dark gray)
- **Success**: `rgb(43, 255, 0)` (Bright green)
- **Error**: `#ff4444` (Red)
- **Text**: `#ccc` (Light gray)

#### Typography
- **Primary Font**: 'Courier New', monospace
- **Fallback Fonts**: 'JetBrains Mono', 'Fira Code'
- **Sizes**: 11px - 18px
- **Weight**: Normal (400)

#### Visual Elements
- **Grid Overlay**: Subtle background pattern
- **Borders**: 1px solid with terminal-style appearance
- **Shadows**: Glowing effects on focus states
- **Animations**: Smooth transitions and loading spinners

### State Management

```javascript
// Main application state
const [inputText, setInputText] = useState('');
const [selectedFile, setSelectedFile] = useState(null);
const [results, setResults] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [status, setStatus] = useState('Ready');
```

### Component Structure

1. **AppContainer**: Main layout wrapper
2. **Header**: Title and subtitle
3. **MainContent**: Two-column grid layout
4. **Panel**: Input sections (text and file)
5. **ResultsPanel**: Display extracted information
6. **StatusBar**: Real-time status updates

### User Experience Flow

1. **Landing**: User sees terminal-style interface
2. **Input**: Choose between text input or file upload
3. **Processing**: Real-time status updates with loading indicator
4. **Results**: Structured display of extracted information
5. **Actions**: Clear results and start over

---

## Data Flow

### Request Processing Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   OpenAI    │
│             │    │             │    │     API     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ POST /process-   │                  │
       │ meeting          │                  │
       ├─────────────────►│                  │
       │                  │                  │
       │                  │ Validate input   │
       │                  │ Parse file       │
       │                  │ (if uploaded)    │
       │                  │                  │
       │                  │ Build prompt     │
       │                  │ Call OpenAI API  │
       │                  ├─────────────────►│
       │                  │                  │
       │                  │                  │ Process text
       │                  │                  │ Generate JSON
       │                  │◄─────────────────┤
       │                  │ JSON response    │
       │                  │                  │
       │                  │ Parse & validate │
       │                  │ Format response  │
       │                  │                  │
       │◄─────────────────┤                  │
       │ Structured data  │                  │
       │                  │                  │
       │ Update UI        │                  │
       │ Display results  │                  │
       │                  │                  │
```

### Data Transformation Pipeline

1. **Input Processing**:
   - Text validation (length, encoding)
   - File reading and content extraction
   - Input sanitization

2. **AI Processing**:
   - Prompt engineering based on options
   - OpenAI API call with structured prompts
   - Response parsing and validation

3. **Output Formatting**:
   - JSON structure validation
   - Data type conversion
   - Response standardization

### Error Flow

```
┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │
│             │    │             │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │ Invalid request  │
       ├─────────────────►│
       │                  │ Validation fails
       │                  │ Log error
       │                  │ Format error response
       │◄─────────────────┤
       │ Error response   │
       │                  │
       │ Display error    │
       │ Update status    │
       │                  │
```

---

## Security Design

### Input Security

1. **Validation**:
   - Joi schema validation for all inputs
   - File type and size restrictions
   - Content length limits

2. **Sanitization**:
   - Input encoding validation
   - Malicious content filtering
   - Path traversal prevention

### API Security

1. **CORS Configuration**:
   ```javascript
   const corsOptions = {
       origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
       methods: ['GET', 'POST', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization'],
       credentials: false
   };
   ```

2. **Rate Limiting**:
   - 10 requests per 15 minutes per IP
   - Configurable via environment variables
   - Disabled in development mode

3. **Security Headers**:
   - Helmet.js for security headers
   - Content Security Policy
   - X-Frame-Options protection

### Data Security

1. **File Handling**:
   - Temporary file storage
   - Automatic cleanup after processing
   - Secure file path generation

2. **Error Handling**:
   - Production-safe error messages
   - No internal details exposure
   - Structured error logging

3. **Environment Variables**:
   - Sensitive data in environment variables
   - No hardcoded secrets
   - Development vs production configurations

---

## Performance Considerations

### Backend Performance

1. **Request Processing**:
   - Asynchronous processing
   - Streaming file uploads
   - Memory-efficient file handling

2. **AI API Optimization**:
   - Request timeout (30 seconds)
   - Retry logic for transient failures
   - Efficient prompt engineering

3. **Resource Management**:
   - Automatic file cleanup
   - Memory leak prevention
   - Connection pooling

### Frontend Performance

1. **Bundle Optimization**:
   - Code splitting potential
   - Tree shaking
   - Minification in production

2. **State Management**:
   - Efficient re-renders
   - Minimal state updates
   - Optimized component structure

3. **Network Optimization**:
   - Request deduplication
   - Loading states
   - Error retry mechanisms

### Scalability Considerations

1. **Horizontal Scaling**:
   - Stateless design
   - Load balancer compatibility
   - Session-free architecture

2. **Caching Strategy**:
   - Response caching potential
   - Static asset caching
   - CDN integration ready

---

## Deployment Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   localhost:3001│    │   localhost:3000│
│   React Dev     │    │   Node.js       │
│   Server        │    │   Express       │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              HTTP Proxy
```

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   API Server    │
│   (Nginx)       │    │   (Static)      │    │   (Node.js)     │
│   Port 80/443   │    │   Port 80       │    │   Port 3000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │   (External)    │
                    └─────────────────┘
```

### Container Architecture (Docker)

```
┌─────────────────────────────────────────┐
│              Docker Network             │
├─────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐│
│  │   Frontend      │ │   Backend       ││
│  │   Container     │ │   Container     ││
│  │   (Nginx)       │ │   (Node.js)     ││
│  │   Port 80       │ │   Port 3000     ││
│  └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────┘
```

### Environment Configuration

**Development**:
- Hot reloading enabled
- Debug logging active
- Rate limiting disabled
- CORS permissive

**Production**:
- Optimized builds
- Error logging only
- Rate limiting enabled
- Strict CORS policy
- Security headers enforced

---

## Future Enhancements

### Technical Improvements

1. **Database Integration**:
   - User session management
   - Processing history
   - Analytics and metrics

2. **Advanced AI Features**:
   - Multiple AI model support
   - Custom prompt templates
   - Confidence scoring

3. **Performance Optimization**:
   - Response caching
   - Request queuing
   - Background processing

### Feature Enhancements

1. **User Management**:
   - Authentication system
   - User preferences
   - Team collaboration

2. **Export Options**:
   - PDF generation
   - Email integration
   - Calendar integration

3. **Advanced Processing**:
   - Batch processing
   - Template customization
   - Multi-language support

This design document serves as the foundation for the AI-Powered Meeting Minutes Extractor, providing clear guidance for development, maintenance, and future enhancements.
