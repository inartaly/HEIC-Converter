import React from "react";

export default function FormatSelector({ formats, value, onChange }) {
  return (
    <div className="format-selector">
      <label htmlFor="format-select">Output format</label>
      <select
        id="format-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {formats.map((fmt) => (
          <option key={fmt} value={fmt}>
            {fmt.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
