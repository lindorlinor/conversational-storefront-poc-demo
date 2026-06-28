import type { CSSProperties, ButtonHTMLAttributes, InputHTMLAttributes } from "react";

const baseButton: CSSProperties = {
  padding: "8px 20px",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  whiteSpace: "nowrap",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };

export function Button({ variant = "secondary", disabled, style, ...rest }: ButtonProps) {
  const variantStyle: CSSProperties = variant === "primary"
    ? { background: "#111827", color: "#fff", border: "none" }
    : { background: "#fff", color: "#111827", border: "1px solid #d1d5db" };
  return (
    <button
      disabled={disabled}
      style={{
        ...baseButton,
        ...variantStyle,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    />
  );
}

export function TextInput({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{ fontSize: 13, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none", ...style }}
      {...rest}
    />
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {children}
    </p>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <p style={{ marginTop: 12, fontSize: 13, color: "#dc2626" }}>{children}</p>;
}
