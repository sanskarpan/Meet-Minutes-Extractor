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