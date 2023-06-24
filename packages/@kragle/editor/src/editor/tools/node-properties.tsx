import { MaterialIcon, bemClasses } from "@kragle/design-system";
import { SceneDocument, useNode } from "@kragle/runtime/v2";
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
  return (
    <ToolFrame className={cls.block(className)} title="Node Properties">
      {selectedNode ? (
        <NodePropertiesList document={document} selectedNode={selectedNode} />
      ) : (
        <div className={cls.element("empty-state")}>No node selected.</div>
      )}
    </ToolFrame>
  );
}

interface NodePropertiesListProps {
  document: SceneDocument;
  selectedNode: string;
}

function NodePropertiesList({
  document,
  selectedNode,
}: NodePropertiesListProps) {
  const nodeData = useNode(document, selectedNode);

  return (
    <div className={cls.element("")}>
      <MaterialIcon icon="link" />
      <MaterialIcon icon="clear" />
      <MaterialIcon icon="calculate" />
      <MaterialIcon icon="text_fields" />
      <MaterialIcon icon="check_box" />
      <MaterialIcon icon="check_box_outline_blank" />
    </div>
  );
}
