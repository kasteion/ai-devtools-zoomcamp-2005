import { LANGUAGE_OPTIONS } from "../constants/languages";
import "../styles/LanguageSelector.css";

export function LanguageSelector({ language, onChange, disabled }) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select">Language:</label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="language-select"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
