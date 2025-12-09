# Quick Start Guide 🚀

Get the coding interview platform running in under 2 minutes!

## Prerequisites

- Node.js 18+ installed
- npm package manager

## Installation & Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd coding-interview-app

# Install all dependencies (backend, frontend, and tests)
npm run install:all
```

### Step 2: Run the Application

```bash
# Start both backend and frontend with one command!
npm run dev
```

That's it! 🎉

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## Using the Application

### 1. Create a Session

1. Open http://localhost:5173 in your browser
2. Click **"Create New Session"**
3. Copy the generated session link

### 2. Join from Another Browser

1. Open the session link in a new browser window or incognito mode
2. Start coding!
3. Watch your code sync in real-time ✨

### 3. Try Code Execution

**JavaScript Example:**

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to the interview, ${name}`;
}

console.log(greet("Candidate"));
```

**Python Example:**

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
```

### 4. Switch Languages

- Use the language dropdown to switch between JavaScript and Python
- Code will reset to the default template
- All connected users will see the change

## Running Tests

```bash
# Run integration tests
npm test
```

Expected output:

```
🎉 All tests passed!
📊 Test Summary:
   ✅ Passed: 7
   ❌ Failed: 0
```

## Available Commands

From the root directory:

```bash
# Development
npm run dev              # Run both backend and frontend
npm run dev:backend      # Run only backend
npm run dev:frontend     # Run only frontend

# Installation
npm run install:all      # Install all dependencies

# Testing
npm test                 # Run integration tests

# Production
npm run build            # Build frontend for production
npm start                # Run both in production mode
```

## Troubleshooting

### Port Already in Use

**Backend (3001):**

```bash
lsof -ti:3001 | xargs kill -9
```

**Frontend (5173):**

```bash
lsof -ti:5173 | xargs kill -9
```

### Connection Issues

1. Check both servers are running
2. Verify no firewall blocking ports 3001 or 5173
3. Check browser console for errors

### Python Not Working

- First Python execution takes 5-10 seconds (Pyodide loading)
- Check browser supports WebAssembly
- Look for errors in browser console

## Next Steps

- 📖 Read [README.md](README.md) for full documentation
- 🏗️ Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- 🔧 Review [TECHNICAL_SPECS.md](TECHNICAL_SPECS.md) for API details
- 🧪 See [tests/README.md](tests/README.md) for testing guide

## Features at a Glance

✅ Real-time collaboration
✅ JavaScript & Python support
✅ Monaco Editor (VS Code's editor)
✅ Safe browser-based execution
✅ Session sharing with links
✅ Multi-user support
✅ Professional UI
✅ Comprehensive tests

---

**Ready to conduct better technical interviews!** 🎯
