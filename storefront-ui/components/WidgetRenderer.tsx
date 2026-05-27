import { ComponentMap } from "../registry-mapper";
import type { ComponentName } from "../../app/components-schema/registry";

interface WidgetRendererProps {
  toolName: ComponentName;
  input: Record<string, unknown>;
  state: string;
}


function WidgetRenderer({ toolName, input }: WidgetRendererProps) {
  const Component = ComponentMap[toolName];
  if (!Component) return null;
    return <Component {...input} />;

  return null;
}

export default WidgetRenderer;
