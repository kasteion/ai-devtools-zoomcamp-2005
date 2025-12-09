# Integration Tests - Online Coding Interview Platform

## Overview

This directory contains comprehensive integration tests that verify the functionality between the frontend and backend of the coding interview platform.

## Test Suite

The integration tests cover the following scenarios:

### 1. Health Check ✅

- Tests the `/api/health` endpoint
- Verifies server is running and responding
- Checks uptime and active sessions count

### 2. Session Creation ✅

- Tests the `/api/sessions/create` endpoint
- Verifies session ID generation (UUID v4)
- Validates share URL creation
- Confirms default language setting

### 3. Get Session Details ✅

- Tests the `/api/sessions/:sessionId` endpoint
- Verifies session retrieval by ID
- Validates session metadata (user count, language, etc.)

### 4. Join Session via WebSocket ✅

- Tests WebSocket connection establishment
- Verifies `join-session` event handling
- Validates `session-joined` response
- Confirms current code and language sync

### 5. Multiple Users Join Session ✅

- Tests concurrent user connections
- Verifies user presence tracking
- Validates user count updates
- Confirms `user-joined` event broadcasting

### 6. Code Synchronization ✅

- Tests real-time code updates
- Verifies `code-change` event emission
- Validates `code-update` event reception
- Confirms code content matches across clients

### 7. Language Change Synchronization ✅

- Tests language switching
- Verifies `language-change` event emission
- Validates `language-update` event broadcasting
- Confirms all users receive language updates

## Running the Tests

### Prerequisites

1. **Backend server must be running:**

```bash
cd backend
npm run dev
```

2. **Frontend server should be running (optional for these tests):**

```bash
cd frontend
npm run dev
```

### Install Test Dependencies

```bash
cd tests
npm install
```

### Run Tests

```bash
cd tests
npm test
```

### Watch Mode (Auto-rerun on changes)

```bash
cd tests
npm run test:watch
```

## Test Results

Expected output when all tests pass:

```
🚀 Starting Integration Tests

==================================================

🧪 Test: Health Check
✅ Health check passed
   Uptime: 629s
   Active Sessions: 0

🧪 Test: Create Session
✅ Session created successfully
   Session ID: 321c23e2-abc3-48d0-9e81-1a3d4dd5a474
   Share URL: http://localhost:5173/session/321c23e2-abc3-48d0-9e81-1a3d4dd5a474

🧪 Test: Get Session Details
✅ Session details retrieved successfully
   User Count: 0
   Language: javascript

🧪 Test: Join Session via WebSocket
   Connected to WebSocket
✅ Joined session successfully
   User Count: 1
   Language: javascript

🧪 Test: Multiple Users Join Session
   Using session: 3a21c203-604b-4a12-aa95-ef027bd747b5
   User 1 joined
   User 2 joined
   User 2 sees 2 users
✅ Multiple users test passed

🧪 Test: Code Synchronization
   Using session: b3637f33-b0bb-44e7-888d-4cef2f4924f2
   User 1 joined
   User 2 joined
   User 1 sending code change...
✅ Code synchronized successfully
   Received code: console.log("Hello from test!");

🧪 Test: Language Change Synchronization
   Using session: 010a4924-6837-489d-9dda-3987068f5045
   User 1 joined
   User 2 joined
   User 1 changing language to Python...
   User 1 received language update
   User 2 received language update
✅ Language change synchronized successfully

==================================================

📊 Test Summary:
   ✅ Passed: 7
   ❌ Failed: 0
   Total: 7

🎉 All tests passed!
```

## Test Architecture

### Technology Stack

- **Node.js**: Test runtime
- **Socket.IO Client**: WebSocket testing
- **Fetch API**: REST API testing
- **ES Modules**: Modern JavaScript syntax

### Test Structure

```
tests/
├── integration/
│   └── session.test.js    # Main integration test suite
├── package.json           # Test dependencies
└── README.md             # This file
```

### Key Features

1. **Async/Await**: Modern promise-based testing
2. **Timeout Protection**: All tests have 5-10 second timeouts
3. **Clean Disconnection**: Proper socket cleanup after each test
4. **Fresh Sessions**: Each multi-user test creates a new session
5. **Detailed Logging**: Clear output for debugging

## Test Coverage

The integration tests verify:

- ✅ REST API endpoints
- ✅ WebSocket connection establishment
- ✅ Socket.IO event handling
- ✅ Session management
- ✅ Real-time synchronization
- ✅ Multi-user scenarios
- ✅ Error handling

## Troubleshooting

### Common Issues

**1. Connection Refused**

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution**: Ensure backend server is running on port 3001

**2. Test Timeout**

```
Error: Test timeout
```

**Solution**:

- Check backend logs for errors
- Verify WebSocket connections are working
- Increase timeout values if needed

**3. Session Not Found**

```
Error: Session not found
```

**Solution**:

- Session may have expired (30 min timeout)
- Ensure backend is properly managing sessions
- Check backend logs for session lifecycle

### Debug Mode

To see detailed Socket.IO logs, add this to your test file:

```javascript
// At the top of session.test.js
import { io } from "socket.io-client";

// Enable debug mode
localStorage.debug = "socket.io-client:*";
```

## Adding New Tests

To add a new test:

1. Create a new async function in `session.test.js`:

```javascript
async function testNewFeature() {
  console.log("\n🧪 Test: New Feature");

  try {
    // Your test logic here

    console.log("✅ Test passed");
    return result;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}
```

2. Add it to the `runTests()` function:

```javascript
async function runTests() {
  // ... existing tests

  // New test
  await testNewFeature();
  passedTests++;
  await wait(500);
}
```

## Best Practices

1. **Always clean up**: Disconnect sockets after tests
2. **Use timeouts**: Prevent hanging tests
3. **Fresh sessions**: Create new sessions for multi-user tests
4. **Clear logging**: Help with debugging
5. **Error handling**: Catch and report errors properly

## CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install backend dependencies
        run: cd backend && npm install

      - name: Start backend
        run: cd backend && npm run dev &

      - name: Wait for backend
        run: sleep 5

      - name: Install test dependencies
        run: cd tests && npm install

      - name: Run integration tests
        run: cd tests && npm test
```

## Performance Benchmarks

Expected test execution times:

- Health Check: < 100ms
- Session Creation: < 200ms
- Get Session: < 100ms
- Join Session: < 1s
- Multiple Users: < 3s
- Code Sync: < 3s
- Language Change: < 3s

**Total Suite Duration**: ~10-15 seconds

## Future Enhancements

Potential additions to the test suite:

- [ ] Test session expiration
- [ ] Test rate limiting
- [ ] Test error scenarios
- [ ] Test with invalid data
- [ ] Test concurrent code changes
- [ ] Test network disconnection/reconnection
- [ ] Test large code files
- [ ] Performance/load testing
- [ ] End-to-end browser tests

## Contributing

When adding new features to the application:

1. Write integration tests first (TDD approach)
2. Ensure all existing tests still pass
3. Update this README with new test descriptions
4. Add appropriate error handling
5. Include timeout protection

## Support

For issues with tests:

1. Check backend logs
2. Verify server is running
3. Review test output carefully
4. Check Socket.IO connection status
5. Consult main project documentation

---

**Last Updated**: 2024-12-09
**Test Suite Version**: 1.0.0
**Status**: ✅ All Tests Passing
