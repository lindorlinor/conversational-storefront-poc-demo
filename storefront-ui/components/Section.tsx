import type { UIMessage } from "@ai-sdk/react";
import WidgetRenderer from "./WidgetRenderer";
import type { ReactNode } from "react";

interface SectionProps {
  message?: UIMessage;
  children?: ReactNode;
}

function Section({ message, children }: SectionProps) {
  return (
    <section className="section tw:pt-3 tw:rounded-widget-base">
      <div className="tw:w-[80%] tw:mx-auto tw:pb-4">
        {children}

        {message?.parts.map((part: UIMessage["parts"][number], i: number) => {

          // testo dell'LLM
          if (part.type === "text") {
            return <p key={i} className="tw:font-widget-secondary tw:text-sm tw:leading-relaxed tw:text-widget-text">{part.text}</p>;
          }

          // widget dal registry
          if (part.type.startsWith("tool-")) {
            const toolPart = part as {
              type: string;
              state: string;
              input: Record<string, unknown>;
            };
            const toolName = toolPart.type.slice("tool-".length);
            return (
              <WidgetRenderer
                key={i}
                toolName={toolName}
                input={toolPart.input}
                state={toolPart.state}
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
