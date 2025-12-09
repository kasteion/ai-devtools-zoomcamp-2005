import { useState, useCallback } from "react";
import { executePythonCode } from "../utils/pyodideLoader";
import { LANGUAGES } from "../constants/languages";

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);

  const executeJavaScript = useCallback(async (code) => {
    return new Promise((resolve) => {
      // Create a new worker for each execution
      const worker = new Worker(
        new URL("../workers/jsExecutor.worker.js", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (event) => {
        const result = event.data;
        worker.terminate();
        resolve(result);
      };

      worker.onerror = (err) => {
        worker.terminate();
        resolve({
          success: false,
          output: "",
          error: err.message,
          executionTime: 0,
          logs: [],
        });
      };

      // Send code to worker
      worker.postMessage({ code, timeout: 5000 });
    });
  }, []);

  const executePython = useCallback(async (code) => {
    return await executePythonCode(code, 10000);
  }, []);

  const executeCode = useCallback(
    async (code, language) => {
      setIsExecuting(true);
      setOutput("");
      setError(null);

      try {
        let result;

        if (language === LANGUAGES.JAVASCRIPT) {
          result = await executeJavaScript(code);
        } else if (language === LANGUAGES.PYTHON) {
          result = await executePython(code);
        } else {
          throw new Error(`Unsupported language: ${language}`);
        }

        if (result.success) {
          // Combine logs and output for JavaScript
          let finalOutput = "";
          if (result.logs && result.logs.length > 0) {
            finalOutput = result.logs.join("\n");
            if (result.output) {
              finalOutput += "\n" + result.output;
            }
          } else {
            finalOutput = result.output;
          }

          setOutput(finalOutput || "(No output)");
          setError(null);
        } else {
          setOutput("");
          setError(result.error);
        }

        return result;
      } catch (err) {
        setOutput("");
        setError(err.message);
        return {
          success: false,
          output: "",
          error: err.message,
          executionTime: 0,
        };
      } finally {
        setIsExecuting(false);
      }
    },
    [executeJavaScript, executePython]
  );

  const clearOutput = useCallback(() => {
    setOutput("");
    setError(null);
  }, []);

  return {
    executeCode,
    isExecuting,
    output,
    error,
    clearOutput,
  };
}
