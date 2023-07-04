import { DialogCommand, IconButton, bemClasses } from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import { SceneDocument, useRootNodeId } from "@kragle/runtime";
import { useCallback, useState } from "react";
import { DataFlowInspector } from "../data-flow-inspector/index.js";
import { ToolFrame } from "../tool-frame.js";
import { NodeTreeElement } from "./node-tree-element.js";

const cls = bemClasses("kragle-node-tree");

export interface NodeTreeProps {
  document: SceneDocument;
  selectedNode: string | null;
  onSelectedNodeChange(nodeId: string | null): void;
  className?: string;
}

export function NodeTree({
  document,
  selectedNode,
  onSelectedNodeChange,
  className,
}: NodeTreeProps) {
  const [dataFlowInspectorController] = useState(
    () => new CommandController<DialogCommand>()
  );

  const rootNodeId = useRootNodeId(document);

  const renameSelectedNode = useCallback(() => {
    const newId = prompt("Enter new node id");
    if (!newId) return;
    try {
      document.applyPatch({
        type: "rename-node",
        nodeId: selectedNode!,
        newId,
      });
      onSelectedNodeChange(newId);
    } catch (e) {
      alert(`${e}`);
    }
  }, [document, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (confirm(`Delete node ${selectedNode}?`)) {
      onSelectedNodeChange(null);
      document.applyPatch({ type: "delete-node", nodeId: selectedNode! });
    }
  }, [document, selectedNode]);

  return (
    <ToolFrame
      className={cls.block(className)}
      title="Nodes"
      actions={
        <>
          <IconButton
            label="Rename node"
            icon="edit"
            disabled={!selectedNode}
            onPress={renameSelectedNode}
          />
          <IconButton
            label="Delete node"
            icon="delete"
            disabled={!selectedNode}
            onPress={deleteSelectedNode}
          />
          <IconButton
            label="Inspect data flow"
            icon="polyline"
            onPress={() => dataFlowInspectorController.send("open")}
          />
          <DataFlowInspector controller={dataFlowInspectorController} />
        </>
      }
    >
      <div className={cls.element("nodes")}>
        {rootNodeId !== null && (
          <NodeTreeElement
            document={document}
            selectedNode={selectedNode}
            onSelectedNodeChange={onSelectedNodeChange}
            nodeId={rootNodeId}
          />
        )}
      </div>
    </ToolFrame>
  );
}
