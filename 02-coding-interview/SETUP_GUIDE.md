# Setup Guide - Online Coding Interview Platform

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd coding-interview-app
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

### Running the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3001`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

App will open at `http://localhost:5173`

#### Option 2: Production Build

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## Testing the Application

### 1. Create a Session

1. Open `http://localhost:5173` in your browser
2. Click "Create New Session"
3. Copy the generated session link

### 2. Join from Multiple Browsers

1. Open the session link in a new browser window or incognito mode
2. You should see the user count increase
3. Start typing code in one window
4. Watch it sync in real-time to the other window

### 3. Test Code Execution

**JavaScript Example:**

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

**Python Example:**

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

### 4. Test Language Switching

1. Select "Python" from the language dropdown
2. Verify that the code resets to Python template
3. Verify that all connected users see the language change

## Troubleshooting

### Backend Issues

**Port 3001 already in use:**

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change the port in backend/.env
PORT=3002
```

**Socket.IO connection errors:**

- Check that CORS_ORIGIN in backend/.env matches your frontend URL
- Verify firewall settings allow WebSocket connections

### Frontend Issues

**Port 5173 already in use:**

```bash
# Vite will automatically try the next available port
# Or specify a different port in vite.config.js
```

**Monaco Editor not loading:**

- Check browser console for errors
- Ensure you have a stable internet connection (Monaco loads from CDN)

**Pyodide not loading:**

- First Python execution may take 5-10 seconds to load Pyodide
- Check browser console for errors
- Ensure you have a stable internet connection

**Code not syncing:**

- Check browser console for WebSocket errors
- Verify backend server is running
- Check that both users are in the same session

### Common Errors

**"Session not found":**

- Session may have expired (30-minute timeout)
- Create a new session

**"Execution timeout exceeded":**

- Code is taking too long to execute
- Check for infinite loops
- Simplify the code

**"Cannot access refs during render" (ESLint warning):**

- This is a known warning in development mode
- It doesn't affect functionality
- Can be safely ignored

## Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SESSION_TIMEOUT=1800000
MAX_SESSION_DURATION=14400000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:

- Frontend: Vite automatically reloads on file changes
- Backend: nodemon restarts server on file changes

### Debugging

**Backend Debugging:**

```bash
# Add console.log statements in backend/src/
# Logs will appear in the backend terminal
```

**Frontend Debugging:**

```bash
# Open browser DevTools (F12)
# Check Console tab for logs
# Check Network tab for WebSocket messages
```

**Socket.IO Debugging:**

```javascript
// In browser console
localStorage.debug = "socket.io-client:*";
// Reload page to see detailed Socket.IO logs
```

### Code Structure

**Adding a new component:**

1. Create component file in `frontend/src/components/`
2. Create corresponding CSS in `frontend/src/styles/`
3. Import and use in `App.jsx`

**Adding a new Socket.IO event:**

1. Add handler in `backend/src/socket/handlers.js`
2. Add listener in `frontend/src/App.jsx`
3. Update documentation

## Performance Optimization

### Frontend

- Monaco Editor is lazy-loaded
- Pyodide loads only on first Python execution
- Code changes are debounced (300ms)
- WebSocket messages are compressed

### Backend

- Sessions auto-cleanup after 30 minutes of inactivity
- In-memory storage (consider Redis for production)
- Connection pooling enabled

## Security Considerations

### Code Execution

- JavaScript runs in isolated Web Workers
- Python runs in WebAssembly sandbox
- No file system access
- No network requests from executed code
- Execution timeout protection (5s for JS, 10s for Python)

### Session Security

- UUID v4 session IDs (cryptographically secure)
- No authentication required (by design)
- Sessions expire after 30 minutes
- No persistent data storage

## Browser Compatibility

### Minimum Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- WebSocket support
- Web Workers
- WebAssembly (for Python)
- ES6+ JavaScript
- LocalStorage

## Next Steps

1. **Test the application** with multiple users
2. **Try different code examples** in both languages
3. **Test edge cases** (long code, rapid typing, disconnections)
4. **Review the architecture** in ARCHITECTURE.md
5. **Check implementation details** in IMPLEMENTATION_GUIDE.md

## Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review browser console for errors
3. Check backend terminal for server errors
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed

## Production Deployment

See IMPLEMENTATION_GUIDE.md Phase 7 for detailed deployment instructions.

Quick checklist:

- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS_ORIGIN
- [ ] Use HTTPS for WebSocket security
- [ ] Set up error logging (Sentry)
- [ ] Configure session storage (Redis)
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Configure CDN for frontend assets
