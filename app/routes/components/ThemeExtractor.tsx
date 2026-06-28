import { useRef } from "react";
import type { ThemeKey } from "../../theme/theme.tokens";
import { Button, SectionHeading, ErrorText } from "./basic-ui-components";

export function ThemeExtractor({ url, files, isExtracting, error, result, onUrlChange, onFilesChange, onExtract }: {
  url: string;
  files: FileList | null;
  isExtracting: boolean;
  error?: string | null;
  result?: Record<ThemeKey, string> | null;
  onUrlChange: (v: string) => void;
  onFilesChange: (files: FileList | null) => void;
  onExtract: () => void;
}) {
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  const canExtract = Boolean(url) || Boolean(files?.length);

  const handleExtract = () => {
    onExtract();
    if (filesInputRef.current) filesInputRef.current.value = "";
  };

  return (
    <s-section>
      <SectionHeading>Design system extractor</SectionHeading>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }} htmlFor="generate-url">
          Page URL
        </label>
        <input
          id="generate-url" type="text" value={url} onChange={e => onUrlChange(e.target.value)}
          style={{ flex: 1, fontSize: 13, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none" }}
        />
        <label htmlFor="file-upload">
          {files?.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Upload design file"}
        </label>
        <input
          id="file-upload" type="file" multiple ref={filesInputRef}
          onChange={e => onFilesChange(e.target.files)} style={{ display: "none" }}
        />
        <Button variant="primary" onClick={handleExtract} disabled={isExtracting || !canExtract}>
          {isExtracting ? "Generating..." : "Generate"}
        </Button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {result && (
        <pre style={{ marginTop: 12, padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, overflowX: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </s-section>
  );
}
