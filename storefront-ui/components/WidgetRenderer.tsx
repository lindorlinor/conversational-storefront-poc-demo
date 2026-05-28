import { ComponentMap } from "../registry-mapper";
import type { ComponentName } from "../../app/components-schema/registry";

function WidgetRenderer({ toolName, input }: { toolName: ComponentName; input: Record<string, unknown> }) {
  const Component = ComponentMap[toolName];
  if (!Component) return null;
    return <Component {...input} />;
}

export default WidgetRenderer;
