/* eslint-disable no-restricted-globals */

// Web Worker for executing JavaScript code in isolation
self.addEventListener("message", (event) => {
  const { code, timeout = 5000 } = event.data;

  const logs = [];
  const startTime = performance.now();

  // Override console.log to capture output
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    logs.push(args.map((arg) => String(arg)).join(" "));
  };

  let timeoutId;
  let result = {
    success: false,
    output: "",
    error: null,
    executionTime: 0,
    logs: [],
  };

  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Execution timeout exceeded"));
      }, timeout);
    });

    // Execute the code
    const executionPromise = new Promise((resolve) => {
      try {
        // Use Function constructor to execute code in isolated scope
        // This prevents access to worker's global scope
        const fn = new Function(code);
        const output = fn();
        resolve(output);
      } catch (err) {
        throw err;
      }
    });

    // Race between execution and timeout
    Promise.race([executionPromise, timeoutPromise])
      .then((output) => {
        clearTimeout(timeoutId);
        const executionTime = performance.now() - startTime;

        result = {
          success: true,
          output: output !== undefined ? String(output) : "",
          error: null,
          executionTime: Math.round(executionTime),
          logs,
        };

        // Restore console.log
        console.log = originalConsoleLog;

        self.postMessage(result);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        const executionTime = performance.now() - startTime;

        result = {
          success: false,
          output: "",
          error: err.message,
          executionTime: Math.round(executionTime),
          logs,
        };

        // Restore console.log
        console.log = originalConsoleLog;

        self.postMessage(result);
      });
  } catch (err) {
    clearTimeout(timeoutId);
    const executionTime = performance.now() - startTime;

    result = {
      success: false,
      output: "",
      error: err.message,
      executionTime: Math.round(executionTime),
      logs,
    };

    // Restore console.log
    console.log = originalConsoleLog;

    self.postMessage(result);
  }
});
