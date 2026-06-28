import type { ThemeEntry } from "../../shopify/theme.server";
import { Button, SectionHeading } from "./basic-ui-components";

function entryLabel(entry: ThemeEntry): string {
  return `${entry.handle} — ${new Date(entry.updatedAt).toLocaleString()}`;
}

export function ThemeEntrySelector({ entries, activeId, selectedId, isCreating, busy, onSelect, onActivate, onNew, onCancel }: {
  entries: ThemeEntry[];
  activeId: string | null;
  selectedId: string | null;
  isCreating: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onActivate: () => void;
  onNew: () => void;
  onCancel: () => void;
}) {
  const isSelectedActive = selectedId !== null && selectedId === activeId;

  return (
    <s-section>
      <SectionHeading>Active configuration</SectionHeading>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }} htmlFor="theme-entry">
          Entry
        </label>
        <select
          id="theme-entry"
          value={isCreating ? "" : (selectedId ?? "")}
          onChange={e => onSelect(e.target.value)}
          disabled={isCreating || entries.length === 0}
          style={{ flex: 1, fontSize: 13, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 4, outline: "none", background: "#fff" }}
        >
          {isCreating && <option value="">New configuration…</option>}
          {entries.length === 0 && !isCreating && <option value="">No saved configuration</option>}
          {entries.map(entry => (
            <option key={entry.id} value={entry.id}>
              {entryLabel(entry)}{entry.id === activeId ? " (active)" : ""}
            </option>
          ))}
        </select>
        <Button onClick={onActivate} disabled={busy || isCreating || !selectedId || isSelectedActive}>
          {isSelectedActive ? "Active" : "Apply"}
        </Button>
        {isCreating ? (
          <Button onClick={onCancel} disabled={busy}>Cancel</Button>
        ) : (
          <Button onClick={onNew} disabled={busy}>New</Button>
        )}
      </div>
    </s-section>
  );
}
