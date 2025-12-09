import "../styles/OutputPanel.css";

export function OutputPanel({ output, error, isExecuting, onClear }) {
  return (
    <div className="output-panel">
      <div className="output-header">
        <h3>Output</h3>
        <button onClick={onClear} className="clear-btn" disabled={isExecuting}>
          Clear
        </button>
      </div>
      <div className="output-content">
        {isExecuting ? (
          <div className="output-loading">
            <div className="spinner"></div>
            <span>Executing code...</span>
          </div>
        ) : error ? (
          <div className="output-error">
            <span className="error-icon">❌</span>
            <pre>{error}</pre>
          </div>
        ) : output ? (
          <pre className="output-text">{output}</pre>
        ) : (
          <div className="output-empty">
            Click "Run Code" to see output here
          </div>
        )}
      </div>
    </div>
  );
}
