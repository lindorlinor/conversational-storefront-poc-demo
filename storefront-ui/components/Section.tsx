import type { UIMessage } from "@ai-sdk/react";
import type { ComponentName } from "../../app/components-schema/registry";
import WidgetRenderer from "./WidgetRenderer";

interface SectionProps {
  message: UIMessage;
}

function Section({ message }: SectionProps) {
  return (
    <div className="section">
      {message.parts.map((part: UIMessage["parts"][number], i: number) => {

        // testo dell'LLM
        if (part.type === "text") {
          return <p key={i} className="section-text">{part.text}</p>;
        }

        // widget dal registry
        if (part.type.startsWith("tool-")) {
          const toolPart = part as {
            type: string;
            state: string;
            input: Record<string, unknown>;
          };
          const toolName = toolPart.type.slice("tool-".length) as ComponentName;
          return (
            <WidgetRenderer
              key={i}
              toolName={toolName}
              input={toolPart.input}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

export default Section;
