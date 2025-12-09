# Online Coding Interview Platform

A real-time collaborative coding interview application built with React, Express.js, and Socket.IO. Supports JavaScript and Python with live code synchronization and browser-based code execution.

## Features

✨ **Real-time Collaboration**

- Multiple users can edit code simultaneously
- Instant synchronization across all connected clients
- Live user presence indicators

🔗 **Easy Session Management**

- Generate unique shareable links
- No authentication required
- Join sessions instantly

💻 **Code Execution**

- Execute JavaScript in isolated Web Workers
- Run Python code using Pyodide (WebAssembly)
- Safe browser-based execution
- Real-time output display

🎨 **Rich Code Editor**

- Monaco Editor (VS Code's editor)
- Syntax highlighting for JavaScript and Python
- Auto-completion and IntelliSense
- Dark/Light theme support

## Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor component
- **Socket.IO Client** - Real-time communication
- **Pyodide** - Python runtime in WebAssembly

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket server
- **UUID** - Session ID generation

## Project Structure

```
coding-interview-app/
├── backend/                 # Express.js server
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── socket/         # Socket.IO handlers
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── workers/       # Web Workers for code execution
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── ARCHITECTURE.md         # System architecture documentation
├── IMPLEMENTATION_GUIDE.md # Step-by-step implementation guide
├── TECHNICAL_SPECS.md      # Technical specifications
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd coding-interview-app
```

2. **Install all dependencies**

```bash
npm run install:all
```

This will install dependencies for the root project, backend, frontend, and tests.

**Or install manually:**

```bash
# Root dependencies (concurrently)
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# Test dependencies
cd ../tests && npm install
```

### Running the Application

**Option 1: Run everything with one command (Recommended) 🚀**

```bash
npm run dev
```

This will start both backend and frontend servers concurrently using a single command!

- Backend will run on `http://localhost:3001`
- Frontend will run on `http://localhost:5173`

**Option 2: Run servers separately**

1. **Start the backend server**

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

2. **Start the frontend (in a new terminal)**

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:5173`

### Environment Configuration

**Backend (.env)**

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SESSION_TIMEOUT=1800000
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## Usage

### Creating an Interview Session

1. Open the application in your browser
2. Click "Create New Session"
3. Copy the generated shareable link
4. Share the link with interview candidates

### Joining a Session

1. Open the shared link in your browser
2. You'll automatically join the session
3. Start coding collaboratively!

### Using the Code Editor

1. **Select Language**: Choose JavaScript or Python from the dropdown
2. **Write Code**: Type in the Monaco Editor
3. **Run Code**: Click the "Run" button to execute
4. **View Output**: See results in the output panel below

### Code Execution Examples

**JavaScript:**

```javascript
// Simple function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

**Python:**

```python
# List comprehension
def squares(n):
    return [i**2 for i in range(n)]

print(squares(10))
```

## API Documentation

### REST Endpoints

#### Create Session

```http
POST /api/sessions/create
Content-Type: application/json

{
  "language": "javascript"
}
```

#### Get Session

```http
GET /api/sessions/:sessionId
```

#### Health Check

```http
GET /api/health
```

### WebSocket Events

**Client → Server:**

- `join-session` - Join an interview session
- `code-change` - Send code updates
- `language-change` - Change programming language

**Server → Client:**

- `session-joined` - Confirmation of joining
- `code-update` - Receive code updates
- `language-update` - Language changed
- `user-joined` - New user joined
- `user-left` - User left session

See [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md) for detailed API documentation.

## Architecture

The application uses a client-server architecture with WebSocket communication for real-time updates:

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   Client 1  │ ◄─────────────────────────► │             │
│  (Browser)  │                             │   Express   │
└─────────────┘                             │   Server    │
                                            │  Socket.IO  │
┌─────────────┐         WebSocket          │             │
│   Client 2  │ ◄─────────────────────────► │             │
│  (Browser)  │                             └─────────────┘
└─────────────┘
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development

### Running Tests

**Integration Tests (Recommended):**

```bash
# Run integration tests
npm test
```

This will run comprehensive integration tests that verify:

- Session creation
- WebSocket connections
- Real-time code synchronization
- Multi-user scenarios
- Language switching

See [`tests/README.md`](tests/README.md) for detailed test documentation.

**Individual Tests:**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**

```bash
cd backend
# No build needed, runs directly with Node.js
node src/server.js
```

**Frontend:**

```bash
cd frontend
npm run build
# Output will be in dist/ folder
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Docker Deployment (Recommended) 🐳

The easiest way to deploy is using Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

Access the application at: **http://localhost:3001**

**Docker Features:**

- ✅ Single container with both frontend and backend
- ✅ Multi-stage build for optimized image size
- ✅ Production-ready configuration
- ✅ Health checks included
- ✅ Easy scaling and deployment

See [`DOCKER_GUIDE.md`](./DOCKER_GUIDE.md) for comprehensive Docker documentation.

### Cloud Deployment

**Recommended platforms:**

- **Railway.app** - Easiest deployment from GitHub
- **AWS ECS** - Enterprise-grade container orchestration
- **Google Cloud Run** - Serverless container platform
- **DigitalOcean App Platform** - Simple container deployment
- **Heroku** - Traditional PaaS deployment

### Manual Deployment

**Backend:**

```bash
cd backend
npm install --only=production
NODE_ENV=production node src/server.js
```

**Frontend:**

```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or static hosting
```

See [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) for detailed deployment instructions.

## Security

### Code Execution Safety

- **JavaScript**: Runs in isolated Web Workers with no DOM access
- **Python**: Executes in WebAssembly sandbox via Pyodide
- **Timeout Protection**: 5s for JS, 10s for Python
- **No Network Access**: Code cannot make external requests

### Session Security

- UUID v4 session IDs (cryptographically secure)
- 30-minute session timeout
- No persistent data storage
- Rate limiting on API endpoints

## Performance

### Benchmarks

- Real-time sync latency: < 100ms
- JavaScript execution: < 2s
- Python execution: < 5s (first run may be slower)
- Supports 10+ concurrent users per session
- Handles 100+ active sessions

### Optimization Tips

1. **Lazy Loading**: Pyodide loads only when first Python code is executed
2. **Debouncing**: Code changes are debounced (300ms) to reduce network traffic
3. **Code Splitting**: React components are lazy-loaded
4. **Compression**: WebSocket messages are compressed

## Troubleshooting

### Common Issues

**Issue: WebSocket connection fails**

- Check CORS configuration in backend
- Ensure backend server is running
- Verify firewall settings

**Issue: Python code doesn't execute**

- Wait for Pyodide to load (first run takes ~5s)
- Check browser console for errors
- Ensure browser supports WebAssembly

**Issue: Code not syncing between users**

- Check network connection
- Verify both users are in the same session
- Check browser console for Socket.IO errors

**Issue: Session link doesn't work**

- Verify session hasn't expired (30 min timeout)
- Check session ID format (should be UUID)
- Ensure backend server is accessible

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required features:**

- WebSocket support
- Web Workers
- WebAssembly (for Python)
- ES6+ JavaScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1 (Current)

- [x] Real-time code synchronization
- [x] JavaScript and Python support
- [x] Monaco Editor integration
- [x] Browser-based code execution

### Phase 2 (Planned)

- [ ] User authentication
- [ ] Session history and replay
- [ ] Code review and annotations
- [ ] Multiple file support
- [ ] Custom test cases

### Phase 3 (Future)

- [ ] Video/audio chat integration
- [ ] More programming languages
- [ ] AI-powered code suggestions
- [ ] Interview templates
- [ ] Analytics dashboard

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:

- Open an issue on GitHub
- Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed setup
- Review [TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md) for API details

## Acknowledgments

- Monaco Editor by Microsoft
- Pyodide by Mozilla
- Socket.IO for real-time communication
- React and Vite teams

---

**Built with ❤️ for better technical interviews**
