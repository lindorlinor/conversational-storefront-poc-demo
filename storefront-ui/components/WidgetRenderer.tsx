import { ComponentMap } from "../registry-mapper";
import { getComponent } from "../component-registry";
import type { ComponentType } from "react";
import Section from "./Section";


function WidgetRenderer({
  toolName,
  input,
  state,
}: {
  toolName: string;
  input: Record<string, unknown>;
  state?: string;
}) {
  const merchantComponent = getComponent(toolName);

  if (
    merchantComponent &&
    state !== "input-available" &&
    state !== "output-available"
  ) {
    return null;
  }

  const Component =
    merchantComponent ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ComponentMap as Record<string, ComponentType<any>>)[toolName];
  if (!Component) return null;

  return (
    <Section>
      <Component {...input} state={state} />
    </Section>
  );
}

export default WidgetRenderer;
