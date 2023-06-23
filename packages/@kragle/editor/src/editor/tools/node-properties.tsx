import { MaterialIcon, bemClasses } from "@kragle/design-system";
import { SceneDocument } from "@kragle/runtime/v2";
import { ToolFrame } from "./tool-frame.js";

const cls = bemClasses("kragle-node-properties");

export interface NodePropertiesProps {
  document: SceneDocument;
  selectedNode: string | null;
  className?: string;
}

export function NodeProperties({
  document,
  selectedNode,
  className,
}: NodePropertiesProps) {
  // const x = useNode(document, selectedNode);
  return (
    <ToolFrame className={cls.block(className)} title="Node Properties">
      <div>
        {selectedNode}
        <MaterialIcon icon="link" />
        <MaterialIcon icon="clear" />
        <MaterialIcon icon="calculate" />
        <MaterialIcon icon="text_fields" />
        <MaterialIcon icon="check_box" />
        <MaterialIcon icon="check_box_outline_blank" />
      </div>
    </ToolFrame>
  );
}
