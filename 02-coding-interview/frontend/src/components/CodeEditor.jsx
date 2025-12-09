import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "../styles/CodeEditor.css";

export function CodeEditor({ code, language, onChange, readOnly = false }) {
  const editorRef = useRef(null);
  const isUpdatingRef = useRef(false);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  function handleEditorChange(value) {
    if (!isUpdatingRef.current && value !== undefined) {
      onChange(value);
    }
  }

  // Update editor value when code changes externally
  useEffect(() => {
    if (editorRef.current && code !== editorRef.current.getValue()) {
      isUpdatingRef.current = true;
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(code);
      if (position) {
        editorRef.current.setPosition(position);
      }
      isUpdatingRef.current = false;
    }
  }, [code]);

  return (
    <div className="code-editor">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
