# Implementation Guide - Online Coding Interview Platform

## Phase 1: Backend Setup

### 1.1 Initialize Backend Project

```bash
mkdir backend
cd backend
npm init -y
npm install express socket.io cors uuid dotenv
npm install --save-dev nodemon
```

### 1.2 Backend File Structure

```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   └── socket.config.js
│   ├── socket/
│   │   ├── handlers.js
│   │   └── rooms.js
│   └── utils/
│       └── sessionManager.js
├── .env
└── package.json
```

### 1.3 Key Backend Components

#### server.js

- Initialize Express app
- Configure CORS
- Set up Socket.IO server
- Define REST endpoints
- Start server on port 3001

#### sessionManager.js

- Generate unique session IDs using UUID v4
- Store active sessions in Map
- Track users per session
- Clean up inactive sessions (30 min timeout)

#### socket/handlers.js

- Handle `join-session` event
- Handle `code-change` event (broadcast to room)
- Handle `language-change` event
- Handle `disconnect` event
- Emit user count updates

#### socket/rooms.js

- Create room for session
- Add user to room
- Remove user from room
- Get room participants
- Broadcast to room members

### 1.4 Socket.IO Events Schema

```javascript
// Client → Server
{
  'join-session': { sessionId, userId, username },
  'code-change': { sessionId, code, language },
  'language-change': { sessionId, language }
}

// Server → Client
{
  'session-joined': { sessionId, currentCode, language, users },
  'code-update': { code, userId },
  'language-update': { language },
  'user-joined': { userId, username, userCount },
  'user-left': { userId, userCount },
  'error': { message }
}
```

## Phase 2: Frontend Setup

### 2.1 Initialize Frontend Project

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install socket.io-client @monaco-editor/react uuid
npm install pyodide
```

### 2.2 Frontend File Structure

```
frontend/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── CodeEditor.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── OutputPanel.jsx
│   │   ├── SessionCreator.jsx
│   │   ├── SessionJoiner.jsx
│   │   └── UserIndicator.jsx
│   ├── hooks/
│   │   ├── useSocket.js
│   │   └── useCodeExecution.js
│   ├── workers/
│   │   └── jsExecutor.worker.js
│   ├── utils/
│   │   ├── codeRunner.js
│   │   └── pyodideLoader.js
│   └── constants/
│       └── languages.js
├── vite.config.js
└── package.json
```

### 2.3 Key Frontend Components

#### App.jsx

- Main application container
- Route handling (create session vs join session)
- State management for session, code, language
- Socket connection initialization

#### CodeEditor.jsx

- Monaco Editor integration
- Props: code, language, onChange, readOnly
- Configure editor options (theme, fontSize, minimap)
- Handle editor mount and value changes
- Debounce changes (300ms) before emitting

#### LanguageSelector.jsx

- Dropdown for JavaScript/Python selection
- Emit language-change event on selection
- Display current language

#### OutputPanel.jsx

- Display code execution results
- Show stdout, stderr, and errors
- Clear output button
- Auto-scroll to bottom

#### SessionCreator.jsx

- Button to create new session
- Generate session link
- Copy to clipboard functionality
- Display shareable link

#### SessionJoiner.jsx

- Input field for session ID
- Join button
- Validation for session ID format

#### UserIndicator.jsx

- Display connected users count
- Show user list (optional)
- Online status indicator

### 2.4 Custom Hooks

#### useSocket.js

```javascript
// Initialize Socket.IO connection
// Handle connection/disconnection
// Provide socket instance to components
// Auto-reconnect logic
```

#### useCodeExecution.js

```javascript
// Execute JavaScript in Web Worker
// Execute Python using Pyodide
// Handle execution timeout (5 seconds)
// Return output, errors, execution time
```

## Phase 3: Code Execution Implementation

### 3.1 JavaScript Execution (Web Worker)

#### jsExecutor.worker.js

```javascript
// Listen for code execution messages
// Use Function constructor to execute code
// Capture console.log output
// Return results or errors
// Implement timeout protection
```

**Safety Measures:**

- No access to DOM
- No access to parent window
- Isolated execution context
- Timeout after 5 seconds

### 3.2 Python Execution (Pyodide)

#### pyodideLoader.js

```javascript
// Load Pyodide on first use (lazy loading)
// Cache Pyodide instance
// Provide execute function
// Handle package imports
```

**Implementation:**

- Load Pyodide from CDN
- Use `pyodide.runPython()` for execution
- Capture stdout/stderr
- Handle async execution
- Timeout protection

## Phase 4: Real-time Synchronization

### 4.1 Code Change Flow

1. User types in Monaco Editor
2. Debounce changes (300ms)
3. Emit `code-change` event with code and sessionId
4. Server broadcasts to all users in room
5. Other clients receive `code-update` event
6. Update Monaco Editor value (if not focused)

### 4.2 Conflict Resolution

- Last write wins (simple approach)
- Optional: Implement Operational Transformation (OT)
- Optional: Use CRDT for conflict-free updates

### 4.3 Synchronization Edge Cases

- Handle user joining mid-session (send current state)
- Handle network disconnection (reconnect and sync)
- Handle rapid typing (debouncing)
- Prevent echo (don't update if user is typing)

## Phase 5: UI/UX Implementation

### 5.1 Layout Structure

```
┌─────────────────────────────────────────┐
│  Header: Logo | Session ID | Users: 2   │
├─────────────────────────────────────────┤
│                                         │
│  Language: [JavaScript ▼]  [Run Code]  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         Monaco Editor                   │
│         (Code Panel)                    │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│         Output Panel                    │
│         > Results appear here           │
└─────────────────────────────────────────┘
```

### 5.2 Responsive Design

- Desktop: Side-by-side editor and output
- Tablet: Stacked layout with tabs
- Mobile: Full-screen editor with collapsible output

### 5.3 Styling Approach

**Option 1: CSS Modules**

- Scoped styles per component
- No global conflicts
- Easy to maintain

**Option 2: Tailwind CSS**

- Utility-first approach
- Rapid development
- Smaller bundle size

**Recommended: Tailwind CSS for faster development**

## Phase 6: Testing Strategy

### 6.1 Backend Tests

```javascript
// Test session creation
// Test room management
// Test socket event handling
// Test session cleanup
```

### 6.2 Frontend Tests

```javascript
// Test component rendering
// Test socket connection
// Test code execution
// Test real-time updates
```

### 6.3 Integration Tests

```javascript
// Test multi-user collaboration
// Test code synchronization
// Test language switching
// Test session lifecycle
```

### 6.4 Manual Testing Checklist

- [ ] Create session and get shareable link
- [ ] Join session from another browser/tab
- [ ] Type code and verify real-time sync
- [ ] Switch language and verify sync
- [ ] Execute JavaScript code
- [ ] Execute Python code
- [ ] Test with 3+ concurrent users
- [ ] Test disconnect/reconnect
- [ ] Test session expiration
- [ ] Test error handling

## Phase 7: Deployment

### 7.1 Environment Variables

**Backend (.env)**

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
SESSION_TIMEOUT=1800000
```

**Frontend (.env)**

```
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

### 7.2 Build Process

**Backend:**

```bash
# No build needed, runs directly with Node.js
node src/server.js
```

**Frontend:**

```bash
npm run build
# Outputs to dist/ folder
```

### 7.3 Deployment Options

**Backend:**

- Railway.app (easiest)
- Heroku
- AWS EC2/ECS
- DigitalOcean

**Frontend:**

- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### 7.4 Production Checklist

- [ ] Enable HTTPS for WebSocket security
- [ ] Configure CORS properly
- [ ] Set up error logging (Sentry)
- [ ] Enable rate limiting
- [ ] Add health check endpoint
- [ ] Configure session cleanup
- [ ] Set up monitoring
- [ ] Add analytics (optional)

## Phase 8: Performance Optimization

### 8.1 Frontend Optimizations

- Lazy load Monaco Editor
- Lazy load Pyodide (on first Python execution)
- Code splitting with React.lazy()
- Memoize expensive computations
- Debounce socket emissions

### 8.2 Backend Optimizations

- Use Redis for session storage (scalability)
- Implement connection pooling
- Add message compression
- Rate limit socket events
- Clean up inactive sessions

### 8.3 Network Optimizations

- Use WebSocket compression
- Minimize payload size
- Send code deltas instead of full content
- Batch multiple updates

## Implementation Timeline

**Week 1: Backend + Basic Frontend**

- Days 1-2: Backend setup and Socket.IO
- Days 3-4: Frontend setup and Monaco Editor
- Days 5-7: Real-time synchronization

**Week 2: Code Execution + Polish**

- Days 1-2: JavaScript execution
- Days 3-4: Python execution with Pyodide
- Days 5-6: UI/UX improvements
- Day 7: Testing and bug fixes

**Week 3: Deployment + Enhancements**

- Days 1-2: Deployment setup
- Days 3-4: Performance optimization
- Days 5-7: Additional features and polish

## Key Dependencies

### Backend

```json
{
  "express": "^4.18.2",
  "socket.io": "^4.6.1",
  "cors": "^2.8.5",
  "uuid": "^9.0.0",
  "dotenv": "^16.0.3"
}
```

### Frontend

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "socket.io-client": "^4.6.1",
  "@monaco-editor/react": "^4.5.0",
  "pyodide": "^0.23.0",
  "uuid": "^9.0.0"
}
```

## Common Pitfalls to Avoid

1. **Not debouncing code changes** → Network flooding
2. **Not handling disconnections** → Lost state
3. **Not validating session IDs** → Security issues
4. **Not limiting execution time** → Infinite loops
5. **Not handling Pyodide loading** → Slow first execution
6. **Not preventing echo updates** → Cursor jumping
7. **Not cleaning up sessions** → Memory leaks
8. **Not handling CORS properly** → Connection failures

## Success Metrics

- Real-time sync latency < 100ms
- Code execution time < 2s (JS), < 5s (Python)
- Support 10+ concurrent users per session
- 99.9% uptime
- Zero data loss on disconnection
