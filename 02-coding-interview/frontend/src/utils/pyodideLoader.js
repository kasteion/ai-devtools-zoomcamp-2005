let pyodideInstance = null;
let loadingPromise = null;

export async function loadPyodide() {
  // Return existing instance if already loaded
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // Return existing loading promise if currently loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading Pyodide
  loadingPromise = (async () => {
    try {
      console.log("Loading Pyodide...");

      // Load Pyodide from CDN
      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
      });

      console.log("Pyodide loaded successfully");
      pyodideInstance = pyodide;
      return pyodide;
    } catch (error) {
      console.error("Failed to load Pyodide:", error);
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export async function executePythonCode(code, timeout = 10000) {
  const startTime = performance.now();

  try {
    // Load Pyodide if not already loaded
    const pyodide = await loadPyodide();

    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Execution timeout exceeded"));
      }, timeout);
    });

    // Execute Python code
    const executionPromise = (async () => {
      // Redirect stdout to capture print statements
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run the user's code
      await pyodide.runPythonAsync(code);

      // Get the captured output
      const output = await pyodide.runPythonAsync("sys.stdout.getvalue()");

      return output;
    })();

    // Race between execution and timeout
    const output = await Promise.race([executionPromise, timeoutPromise]);
    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output: output || "",
      error: null,
      executionTime: Math.round(executionTime),
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;

    return {
      success: false,
      output: "",
      error: error.message,
      executionTime: Math.round(executionTime),
    };
  }
}
