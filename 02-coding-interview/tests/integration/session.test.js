import { io } from "socket.io-client";

const API_URL = "http://localhost:3001";
const SOCKET_URL = "http://localhost:3001";

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test: Create a new session
async function testCreateSession() {
  console.log("\n🧪 Test: Create Session");

  try {
    const response = await fetch(`${API_URL}/api/sessions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language: "javascript" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response
    if (!data.sessionId) {
      throw new Error("Session ID not returned");
    }

    if (!data.shareUrl) {
      throw new Error("Share URL not returned");
    }

    if (data.language !== "javascript") {
      throw new Error("Language mismatch");
    }

    console.log("✅ Session created successfully");
    console.log(`   Session ID: ${data.sessionId}`);
    console.log(`   Share URL: ${data.shareUrl}`);

    return data.sessionId;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

// Test: Get session details
async function testGetSession(sessionId) {
  console.log("\n🧪 Test: Get Session Details");

  try {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response
    if (data.sessionId !== sessionId) {
      throw new Error("Session ID mismatch");
    }

    if (!data.exists) {
      throw new Error("Session should exist");
    }

    console.log("✅ Session details retrieved successfully");
    console.log(`   User Count: ${data.userCount}`);
    console.log(`   Language: ${data.language}`);

    return data;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

// Test: Join session via WebSocket
async function testJoinSession(sessionId) {
  console.log("\n🧪 Test: Join Session via WebSocket");

  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error("Connection timeout"));
    }, 5000);

    socket.on("connect", () => {
      console.log("   Connected to WebSocket");

      socket.emit("join-session", {
        sessionId,
        userId: "test-user-1",
        username: "Test User 1",
      });
    });

    socket.on("session-joined", (data) => {
      clearTimeout(timeout);

      // Validate response
      if (data.sessionId !== sessionId) {
        socket.disconnect();
        reject(new Error("Session ID mismatch"));
        return;
      }

      if (!data.currentCode) {
        socket.disconnect();
        reject(new Error("Current code not returned"));
        return;
      }

      if (!data.language) {
        socket.disconnect();
        reject(new Error("Language not returned"));
        return;
      }

      console.log("✅ Joined session successfully");
      console.log(`   User Count: ${data.userCount}`);
      console.log(`   Language: ${data.language}`);

      socket.disconnect();
      resolve(data);
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(error);
    });
  });
}

// Test: Multiple users joining same session
async function testMultipleUsers() {
  console.log("\n🧪 Test: Multiple Users Join Session");

  // Create a fresh session for this test
  const response = await fetch(`${API_URL}/api/sessions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "javascript" }),
  });
  const { sessionId } = await response.json();
  console.log(`   Using session: ${sessionId}`);

  return new Promise((resolve, reject) => {
    const socket1 = io(SOCKET_URL, { transports: ["websocket"] });
    const socket2 = io(SOCKET_URL, { transports: ["websocket"] });

    let user1Joined = false;
    let user2Joined = false;
    let user2SeesUser1 = false;

    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error("Test timeout"));
    }, 10000);

    // User 1 joins
    socket1.on("connect", () => {
      socket1.emit("join-session", {
        sessionId,
        userId: "test-user-1",
        username: "User 1",
      });
    });

    socket1.on("session-joined", (data) => {
      user1Joined = true;
      console.log("   User 1 joined");

      // Now connect user 2
      socket2.emit("join-session", {
        sessionId,
        userId: "test-user-2",
        username: "User 2",
      });
    });

    socket1.on("user-joined", (data) => {
      if (data.userId === "test-user-2") {
        console.log("   User 1 sees User 2 joined");
        console.log(`   Total users: ${data.userCount}`);

        if (data.userCount === 2) {
          user2SeesUser1 = true;
        }
      }
    });

    // User 2 joins
    socket2.on("connect", () => {
      // Wait for user 1 to join first
    });

    socket2.on("session-joined", (data) => {
      user2Joined = true;
      console.log("   User 2 joined");
      console.log(`   User 2 sees ${data.userCount} users`);

      // Check if all conditions met
      if (user1Joined && user2Joined && data.userCount === 2) {
        clearTimeout(timeout);
        console.log("✅ Multiple users test passed");

        socket1.disconnect();
        socket2.disconnect();
        resolve();
      }
    });

    socket1.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });

    socket2.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });
  });
}

// Test: Code synchronization
async function testCodeSync() {
  console.log("\n🧪 Test: Code Synchronization");

  // Create a fresh session for this test
  const response = await fetch(`${API_URL}/api/sessions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "javascript" }),
  });
  const { sessionId } = await response.json();
  console.log(`   Using session: ${sessionId}`);

  return new Promise((resolve, reject) => {
    const socket1 = io(SOCKET_URL, { transports: ["websocket"] });
    const socket2 = io(SOCKET_URL, { transports: ["websocket"] });

    const testCode = 'console.log("Hello from test!");';
    let user1Joined = false;
    let user2Joined = false;

    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error("Test timeout"));
    }, 10000);

    // User 1 setup
    socket1.on("connect", () => {
      socket1.emit("join-session", {
        sessionId,
        userId: "test-user-1",
        username: "User 1",
      });
    });

    socket1.on("session-joined", () => {
      user1Joined = true;
      console.log("   User 1 joined");

      // Connect user 2
      socket2.emit("join-session", {
        sessionId,
        userId: "test-user-2",
        username: "User 2",
      });
    });

    // User 2 setup
    socket2.on("session-joined", () => {
      user2Joined = true;
      console.log("   User 2 joined");

      // User 1 sends code change
      setTimeout(() => {
        console.log("   User 1 sending code change...");
        socket1.emit("code-change", {
          sessionId,
          code: testCode,
          userId: "test-user-1",
        });
      }, 500);
    });

    // User 2 receives code update
    socket2.on("code-update", (data) => {
      if (data.code === testCode && data.userId === "test-user-1") {
        clearTimeout(timeout);
        console.log("✅ Code synchronized successfully");
        console.log(`   Received code: ${data.code}`);

        socket1.disconnect();
        socket2.disconnect();
        resolve();
      } else {
        clearTimeout(timeout);
        socket1.disconnect();
        socket2.disconnect();
        reject(new Error("Code mismatch"));
      }
    });

    socket1.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });

    socket2.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });
  });
}

// Test: Language change synchronization
async function testLanguageChange() {
  console.log("\n🧪 Test: Language Change Synchronization");

  // Create a fresh session for this test
  const response = await fetch(`${API_URL}/api/sessions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "javascript" }),
  });
  const { sessionId } = await response.json();
  console.log(`   Using session: ${sessionId}`);

  return new Promise((resolve, reject) => {
    const socket1 = io(SOCKET_URL, { transports: ["websocket"] });
    const socket2 = io(SOCKET_URL, { transports: ["websocket"] });

    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error("Test timeout"));
    }, 10000);

    // User 1 setup
    socket1.on("connect", () => {
      socket1.emit("join-session", {
        sessionId,
        userId: "test-user-1",
        username: "User 1",
      });
    });

    socket1.on("session-joined", () => {
      console.log("   User 1 joined");

      // Connect user 2
      socket2.emit("join-session", {
        sessionId,
        userId: "test-user-2",
        username: "User 2",
      });
    });

    // User 2 setup
    socket2.on("session-joined", () => {
      console.log("   User 2 joined");

      // User 1 changes language
      setTimeout(() => {
        console.log("   User 1 changing language to Python...");
        socket1.emit("language-change", {
          sessionId,
          language: "python",
          userId: "test-user-1",
        });
      }, 500);
    });

    // Both users receive language update
    let user1Updated = false;
    let user2Updated = false;

    socket1.on("language-update", (data) => {
      if (data.language === "python") {
        user1Updated = true;
        console.log("   User 1 received language update");
        checkCompletion();
      }
    });

    socket2.on("language-update", (data) => {
      if (data.language === "python") {
        user2Updated = true;
        console.log("   User 2 received language update");
        checkCompletion();
      }
    });

    function checkCompletion() {
      if (user1Updated && user2Updated) {
        clearTimeout(timeout);
        console.log("✅ Language change synchronized successfully");

        socket1.disconnect();
        socket2.disconnect();
        resolve();
      }
    }

    socket1.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });

    socket2.on("error", (error) => {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      reject(error);
    });
  });
}

// Test: Health check
async function testHealthCheck() {
  console.log("\n🧪 Test: Health Check");

  try {
    const response = await fetch(`${API_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Health check failed");
    }

    console.log("✅ Health check passed");
    console.log(`   Uptime: ${Math.round(data.uptime)}s`);
    console.log(`   Active Sessions: ${data.activeSessions}`);

    return data;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Integration Tests\n");
  console.log("=".repeat(50));

  let sessionId;
  let passedTests = 0;
  let failedTests = 0;

  try {
    // Test 1: Health Check
    await testHealthCheck();
    passedTests++;
    await wait(500);

    // Test 2: Create Session
    sessionId = await testCreateSession();
    passedTests++;
    await wait(500);

    // Test 3: Get Session
    await testGetSession(sessionId);
    passedTests++;
    await wait(500);

    // Test 4: Join Session
    await testJoinSession(sessionId);
    passedTests++;
    await wait(500);

    // Test 5: Multiple Users
    await testMultipleUsers();
    passedTests++;
    await wait(500);

    // Test 6: Code Synchronization
    await testCodeSync();
    passedTests++;
    await wait(500);

    // Test 7: Language Change
    await testLanguageChange();
    passedTests++;
  } catch (error) {
    failedTests++;
    console.error("\n❌ Test suite failed:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Test Summary:");
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   Total: ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests failed");
    process.exit(1);
  }
}

// Run tests
runTests();
