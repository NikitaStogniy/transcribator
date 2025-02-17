"use client";

import { useState } from "react";
import "./FormatSettings.css";

export interface FormatOptions {
  highlightColor: string;
  speakerColor: string;
  timeColor: string;
  boldSpeaker: boolean;
  italicText: boolean;
  fontSize: number;
}

interface FormatSettingsProps {
  options: FormatOptions;
  onChange: (options: FormatOptions) => void;
}

const defaultColors = [
  "#60A5FA", // blue
  "#34D399", // green
  "#F87171", // red
  "#FBBF24", // yellow
  "#A78BFA", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

export default function FormatSettings({
  options,
  onChange,
}: FormatSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (changes: Partial<FormatOptions>) => {
    onChange({ ...options, ...changes });
  };

  return (
    <div className="format-settings">
      <button
        className="format-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Format settings"
      >
        <span className="icon">⚙️</span>
        Format
      </button>

      {isOpen && (
        <div className="format-panel">
          <div className="format-section">
            <h3>Colors</h3>
            <div className="color-option">
              <label>Highlight:</label>
              <div className="color-picker">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${
                      options.highlightColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange({ highlightColor: color })}
                  />
                ))}
                <input
                  type="color"
                  value={options.highlightColor}
                  onChange={(e) =>
                    handleChange({ highlightColor: e.target.value })
                  }
                  title="Custom color"
                />
              </div>
            </div>

            <div className="color-option">
              <label>Speaker:</label>
              <div className="color-picker">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${
                      options.speakerColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange({ speakerColor: color })}
                  />
                ))}
                <input
                  type="color"
                  value={options.speakerColor}
                  onChange={(e) =>
                    handleChange({ speakerColor: e.target.value })
                  }
                  title="Custom color"
                />
              </div>
            </div>

            <div className="color-option">
              <label>Time:</label>
              <div className="color-picker">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${
                      options.timeColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange({ timeColor: color })}
                  />
                ))}
                <input
                  type="color"
                  value={options.timeColor}
                  onChange={(e) => handleChange({ timeColor: e.target.value })}
                  title="Custom color"
                />
              </div>
            </div>
          </div>

          <div className="format-section">
            <h3>Text Style</h3>
            <div className="style-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.boldSpeaker}
                  onChange={(e) =>
                    handleChange({ boldSpeaker: e.target.checked })
                  }
                />
                Bold speaker names
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.italicText}
                  onChange={(e) =>
                    handleChange({ italicText: e.target.checked })
                  }
                />
                Italic text
              </label>
            </div>
          </div>

          <div className="format-section">
            <h3>Font Size</h3>
            <div className="font-size-control">
              <button
                onClick={() =>
                  handleChange({ fontSize: Math.max(12, options.fontSize - 1) })
                }
              >
                -
              </button>
              <span>{options.fontSize}px</span>
              <button
                onClick={() =>
                  handleChange({ fontSize: Math.min(24, options.fontSize + 1) })
                }
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
