import { ComponentMap } from "../registry-mapper";
import { getComponent } from "../component-registry";
import type { ComponentType } from "react";

// toolName è arbitrario (può essere un nome registrato dal merchant): prima
// cerco nel registro runtime del merchant, poi nel ComponentMap di default
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
  return <Component {...input} />;
}

export default WidgetRenderer;
