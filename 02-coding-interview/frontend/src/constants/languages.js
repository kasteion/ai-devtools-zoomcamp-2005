export const LANGUAGES = {
  JAVASCRIPT: "javascript",
  PYTHON: "python",
};

export const DEFAULT_CODE = {
  javascript: `// Write your JavaScript code here

function solution() {
  // Your code here
  console.log("Hello, World!");
}

solution();`,
  python: `# Write your Python code here

def solution():
    # Your code here
    print("Hello, World!")

solution()`,
};

export const LANGUAGE_OPTIONS = [
  { value: LANGUAGES.JAVASCRIPT, label: "JavaScript" },
  { value: LANGUAGES.PYTHON, label: "Python" },
];
