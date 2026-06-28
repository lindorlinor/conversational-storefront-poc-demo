import { SECTIONS, COLOR_KEYS, HEX6, type ThemeKey } from "../../theme/theme.tokens";
import { SectionHeading } from "./basic-ui-components";


export function ThemeFieldGrid({ theme, onChange }: {
  theme: Record<ThemeKey, string>;
  onChange: (key: ThemeKey, value: string) => void;
}) {
  return (
    <>
      {SECTIONS.map(({ heading, keys }) => (
        <s-section key={heading}>
          <SectionHeading>{heading}</SectionHeading>
          {keys.map(key => {
            const value = theme[key];
            const isColor = COLOR_KEYS.has(key);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 290, fontFamily: "monospace", fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
                  --{key}
                </span>
                {isColor && (
                  <input
                    type="color"
                    value={HEX6.test(value) ? value : "#000000"}
                    onChange={e => onChange(key, e.target.value)}
                    style={{ width: 34, height: 28, padding: 2, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                  />
                )}
                <input
                  type="text"
                  value={value}
                  onChange={e => onChange(key, e.target.value)}
                  placeholder={isColor ? "#rrggbb" : "CSS value"}
                  style={{ width: isColor ? 100 : 160, fontFamily: "monospace", fontSize: 13, padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none" }}
                />
              </div>
            );
          })}
        </s-section>
      ))}
    </>
  );
}
