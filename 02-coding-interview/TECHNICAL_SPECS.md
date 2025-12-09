# Technical Specifications - Online Coding Interview Platform

## Data Models

### Session Model

```javascript
{
  id: string,              // UUID v4
  createdAt: timestamp,    // ISO 8601
  lastActivity: timestamp, // ISO 8601
  code: string,            // Current code content
  language: string,        // 'javascript' | 'python'
  users: Map<string, User> // Connected users
}
```

### User Model

```javascript
{
  id: string,        // UUID v4
  socketId: string,  // Socket.IO connection ID
  username: string,  // Display name (optional)
  joinedAt: timestamp
}
```

### Code Change Event

```javascript
{
  sessionId: string,
  code: string,
  language: string,
  userId: string,
  timestamp: number
}
```

## REST API Specification

### Base URL

- Development: `http://localhost:3001`
- Production: `https://api.your-domain.com`

### Endpoints

#### POST /api/sessions/create

Create a new interview session.

**Request:**

```json
{
  "language": "javascript" // optional, defaults to "javascript"
}
```

**Response (201):**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "language": "javascript",
  "shareUrl": "http://localhost:5173/session/550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (500):**

```json
{
  "error": "Failed to create session",
  "message": "Internal server error"
}
```

---

#### GET /api/sessions/:sessionId

Get session details.

**Response (200):**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastActivity": "2024-01-15T10:35:00.000Z",
  "language": "javascript",
  "userCount": 2,
  "exists": true
}
```

**Error Response (404):**

```json
{
  "error": "Session not found",
  "sessionId": "invalid-id"
}
```

---

#### GET /api/health

Health check endpoint.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "activeSessions": 5
}
```

## WebSocket API Specification

### Connection

```javascript
const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

### Client → Server Events

#### join-session

Join an existing interview session.

**Payload:**

```javascript
{
  sessionId: string,    // Required
  userId: string,       // Required (UUID)
  username: string      // Optional
}
```

**Server Response Events:**

- `session-joined` (success)
- `error` (failure)

---

#### code-change

Send code updates to other participants.

**Payload:**

```javascript
{
  sessionId: string,
  code: string,
  language: string,
  userId: string
}
```

**Server Broadcast:**

- Emits `code-update` to all other users in session

---

#### language-change

Change the programming language.

**Payload:**

```javascript
{
  sessionId: string,
  language: string,  // 'javascript' | 'python'
  userId: string
}
```

**Server Broadcast:**

- Emits `language-update` to all users in session

---

#### disconnect

User disconnects (automatic event).

**Server Actions:**

- Remove user from session
- Emit `user-left` to remaining users
- Clean up session if empty

### Server → Client Events

#### session-joined

Confirmation that user successfully joined session.

**Payload:**

```javascript
{
  sessionId: string,
  currentCode: string,
  language: string,
  users: Array<{
    id: string,
    username: string
  }>,
  userCount: number
}
```

---

#### code-update

Receive code updates from other users.

**Payload:**

```javascript
{
  code: string,
  userId: string,
  timestamp: number
}
```

---

#### language-update

Language was changed by another user.

**Payload:**

```javascript
{
  language: string,
  userId: string
}
```

---

#### user-joined

New user joined the session.

**Payload:**

```javascript
{
  userId: string,
  username: string,
  userCount: number
}
```

---

#### user-left

User left the session.

**Payload:**

```javascript
{
  userId: string,
  userCount: number
}
```

---

#### error

Error occurred during operation.

**Payload:**

```javascript
{
  message: string,
  code: string,  // 'SESSION_NOT_FOUND' | 'INVALID_SESSION' | 'CONNECTION_ERROR'
  details: object // Optional additional info
}
```

## Code Execution Specification

### JavaScript Execution

**Input:**

```javascript
{
  code: string,
  timeout: number // milliseconds, default 5000
}
```

**Output:**

```javascript
{
  success: boolean,
  output: string,      // stdout
  error: string,       // stderr or error message
  executionTime: number, // milliseconds
  logs: Array<string>  // console.log outputs
}
```

**Example:**

```javascript
// Input
{
  code: "console.log('Hello'); return 1 + 1;",
  timeout: 5000
}

// Output
{
  success: true,
  output: "2",
  error: null,
  executionTime: 12,
  logs: ["Hello"]
}
```

### Python Execution (Pyodide)

**Input:**

```javascript
{
  code: string,
  timeout: number // milliseconds, default 10000
}
```

**Output:**

```javascript
{
  success: boolean,
  output: string,
  error: string,
  executionTime: number
}
```

**Example:**

```javascript
// Input
{
  code: "print('Hello')\nresult = 1 + 1\nprint(result)",
  timeout: 10000
}

// Output
{
  success: true,
  output: "Hello\n2",
  error: null,
  executionTime: 156
}
```

## Monaco Editor Configuration

### Editor Options

```javascript
{
  value: string,              // Code content
  language: string,           // 'javascript' | 'python'
  theme: 'vs-dark',          // or 'vs-light'
  automaticLayout: true,
  fontSize: 14,
  minimap: {
    enabled: true
  },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  lineNumbers: 'on',
  renderWhitespace: 'selection',
  tabSize: 2,
  insertSpaces: true,
  formatOnPaste: true,
  formatOnType: true
}
```

### Language Configuration

**JavaScript:**

```javascript
{
  language: 'javascript',
  defaultValue: '// Write your JavaScript code here\n\nfunction solution() {\n  // Your code\n}\n\nsolution();'
}
```

**Python:**

```javascript
{
  language: 'python',
  defaultValue: '# Write your Python code here\n\ndef solution():\n    # Your code\n    pass\n\nsolution()'
}
```

## Security Specifications

### Code Execution Sandbox

**JavaScript (Web Worker):**

- No DOM access
- No window object access
- No network requests
- Timeout enforcement
- Memory limit (browser-dependent)

**Python (Pyodide):**

- WebAssembly sandbox
- No file system access
- No network requests (unless explicitly allowed)
- Timeout enforcement
- Limited package imports

### Session Security

**Session ID Generation:**

```javascript
import { v4 as uuidv4 } from "uuid";
const sessionId = uuidv4(); // Cryptographically secure
```

**Session Validation:**

- UUID v4 format validation
- Session existence check
- Session expiration check (30 minutes)

### Rate Limiting

**Code Execution:**

- Max 10 executions per minute per user
- Max execution time: 5s (JS), 10s (Python)

**Socket Events:**

- Max 100 messages per minute per connection
- Debounce code changes: 300ms

**Session Creation:**

- Max 5 sessions per IP per hour

## Performance Requirements

### Response Times

- REST API: < 100ms
- WebSocket latency: < 50ms
- Code sync delay: < 100ms
- JS execution: < 2s
- Python execution: < 5s (first run may take longer due to Pyodide loading)

### Scalability

- Support 100+ concurrent sessions
- Support 10+ users per session
- Handle 1000+ WebSocket connections

### Resource Limits

- Max code size: 100KB
- Max output size: 10KB
- Session timeout: 30 minutes
- Max session duration: 4 hours

## Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### WebSocket Error Codes

- `SESSION_NOT_FOUND` - Session does not exist
- `INVALID_SESSION` - Invalid session ID format
- `SESSION_EXPIRED` - Session has expired
- `CONNECTION_ERROR` - WebSocket connection failed
- `EXECUTION_TIMEOUT` - Code execution timed out
- `EXECUTION_ERROR` - Code execution failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Environment Variables

### Backend

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Session Configuration
SESSION_TIMEOUT=1800000  # 30 minutes in ms
MAX_SESSION_DURATION=14400000  # 4 hours in ms

# Rate Limiting
MAX_EXECUTIONS_PER_MINUTE=10
MAX_SESSIONS_PER_HOUR=5

# Logging
LOG_LEVEL=info
```

### Frontend

```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# Feature Flags
VITE_ENABLE_PYTHON=true
VITE_ENABLE_ANALYTICS=false

# Pyodide Configuration
VITE_PYODIDE_CDN=https://cdn.jsdelivr.net/pyodide/v0.23.0/full/
```

## Testing Specifications

### Unit Test Coverage

- Minimum 80% code coverage
- All utility functions tested
- All socket handlers tested
- All React components tested

### Integration Test Scenarios

1. Create session → Join session → Sync code
2. Multiple users editing simultaneously
3. Language switching with active users
4. User disconnect and reconnect
5. Session expiration handling
6. Code execution with various inputs

### Performance Test Scenarios

1. 100 concurrent sessions
2. 10 users per session typing simultaneously
3. Large code files (50KB+)
4. Rapid language switching
5. Network latency simulation

## Monitoring and Logging

### Metrics to Track

- Active sessions count
- Connected users count
- Code execution success rate
- Average execution time
- WebSocket message rate
- Error rate by type
- Session creation rate

### Log Levels

- `ERROR` - Critical errors requiring attention
- `WARN` - Warning conditions
- `INFO` - Informational messages
- `DEBUG` - Detailed debugging information

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "Session created",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "metadata": {}
}
```

## Browser Compatibility

### Minimum Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- WebSocket support
- Web Workers support
- WebAssembly support (for Pyodide)
- ES6+ support
- LocalStorage support

## Deployment Configuration

### Backend (Node.js)

```json
{
  "name": "coding-interview-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Frontend (Vite)

```json
{
  "name": "coding-interview-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Docker Configuration (Optional)

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
