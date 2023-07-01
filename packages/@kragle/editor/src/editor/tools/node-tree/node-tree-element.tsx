import { IconButton, bemClasses } from "@kragle/design-system";
import { SceneDocument, useNode } from "@kragle/runtime/v2";
import { memo, useState } from "react";

const cls = bemClasses("kragle-node-tree-element");

export interface NodeTreeElementProps {
  document: SceneDocument;
  selectedNode: string | null;
  onSelectedNodeChange(nodeId: string | null): void;
  nodeId: string;
}

export const NodeTreeElement = memo(function NodeTreeElement_({
  document,
  selectedNode,
  onSelectedNodeChange,
  nodeId,
}: NodeTreeElementProps) {
  const nodeData = useNode(document, nodeId);

  const [collapsed, setCollapsed] = useState(new Set<string>());
  function toggleCollapsed(slotName: string) {
    const result = new Set(collapsed);
    collapsed.has(slotName) ? result.delete(slotName) : result.add(slotName);
    setCollapsed(result);
  }

  const selected = nodeId === selectedNode;
  function toggleSelected() {
    onSelectedNodeChange(selected ? null : nodeId);
  }

  return (
    <div className={cls.block()}>
      <div
        className={cls.element("node-id", null, selected && "selected")}
        onClick={toggleSelected}
      >
        {nodeId}
      </div>
      <ul className={cls.element("slots")}>
        {nodeData.schema.forEachSlot((slotName, { isCollectionSlot }) => {
          const isCollapsed = collapsed.has(slotName);
          return (
            <li key={slotName} className={cls.element("slot")}>
              <div className={cls.element("slot-name")}>
                <IconButton
                  className={cls.element("expand-button")}
                  label={isCollapsed ? "Expand" : "Collapse"}
                  icon={isCollapsed ? "arrow_right" : "arrow_drop_down"}
                  onPress={() => toggleCollapsed(slotName)}
                />
                {slotName}
                {(isCollectionSlot || !nodeData.slots[slotName]) && (
                  <IconButton
                    className={cls.element("add-button")}
                    label="Add"
                    icon="add"
                  />
                )}
              </div>
              {!isCollapsed && (
                <ul className={cls.element("children")}>
                  {nodeData.forEachChildInSlot(slotName, (childId) => (
                    <NodeTreeElement
                      key={childId}
                      document={document}
                      selectedNode={selectedNode}
                      onSelectedNodeChange={onSelectedNodeChange}
                      nodeId={childId}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
});