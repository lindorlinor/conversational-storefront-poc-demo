import type { UIMessage } from "@ai-sdk/react";
import type { ComponentName } from "../../app/components-schema/registry";
import WidgetRenderer from "./WidgetRenderer";
import type { ReactNode } from "react";

interface SectionProps {
  message?: UIMessage;
  children?: ReactNode;
}

function Section({ message, children }: SectionProps) {
  return (
    <section className="section">
      <div className="pb-4">
        {children}

        {message?.parts.map((part: UIMessage["parts"][number], i: number) => {

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
    </section>
  );
}

export default Section;
