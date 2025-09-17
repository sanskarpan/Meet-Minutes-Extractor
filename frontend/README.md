# Meeting Minutes Extractor - Frontend

A React-based frontend with a dark terminal aesthetic for the AI-powered meeting minutes extractor.

## Features

- **Dark Terminal Theme**: Inspired by cyberpunk/hacker terminals with green monospace text
- **Grid Background**: Subtle grid overlay for that authentic terminal feel
- **Dual Input Methods**: Support for both text input and file upload
- **Real-time Processing**: Live status updates and loading indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Styled Components**: Modern CSS-in-JS styling approach

## Design Elements

- **Color Scheme**: Dark background (#0a0a0a) with bright green text (#ff4d00)
- **Typography**: Monospace fonts (Courier New, JetBrains Mono, Fira Code)
- **Grid Pattern**: Subtle green grid overlay
- **Glowing Effects**: Focus states with green glow
- **Terminal Aesthetics**: Borders, panels, and status bar mimicking terminal interfaces

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Backend Integration

The frontend communicates with the backend API running on `http://localhost:3000`:

- **Health Check**: `GET /health`
- **Process Meeting**: `POST /process-meeting`

The app supports both text input and file upload methods, automatically handling the appropriate API calls.

## File Structure

```
src/
├── App.js          # Main application component
├── App.css         # Terminal-style CSS
├── index.js        # React entry point
└── index.css       # Global styles
```

## Dependencies

- **React**: UI framework
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client for API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

The app runs on `http://localhost:3001` by default and proxies API requests to the backend on port 3000.

## Styling Philosophy

The interface is designed to match the cyberpunk/terminal aesthetic shown in the reference image:
- Dark backgrounds with bright green accents
- Monospace typography throughout
- Grid patterns and subtle glowing effects
- Minimalist, functional design
- High contrast for readability