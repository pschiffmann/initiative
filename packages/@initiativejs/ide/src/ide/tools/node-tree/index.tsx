import { Button, DialogCommand, IconButton, bemClasses } from "#design-system";
import { SceneDocument, useRootNodeId } from "#shared";
import { CommandController } from "@initiativejs/react-command";
import { useCallback, useState } from "react";
import { DataFlowInspector } from "../data-flow-inspector/index.js";
import { ToolFrame } from "../tool-frame.js";
import { CreateNodeDialog } from "./create-node-dialog.js";
import { NodeTreeElement } from "./node-tree-element.js";

const cls = bemClasses("initiative-node-tree");

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
    () => new CommandController<DialogCommand>(),
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
      {rootNodeId !== null ? (
        <div className={cls.element("nodes")}>
          <NodeTreeElement
            document={document}
            selectedNode={selectedNode}
            onSelectedNodeChange={onSelectedNodeChange}
            nodeId={rootNodeId}
          />
        </div>
      ) : (
        <CreateRootNodeButton document={document} />
      )}
    </ToolFrame>
  );
}

interface CreateRootNodeButtonProps {
  document: SceneDocument;
}

function CreateRootNodeButton({ document }: CreateRootNodeButtonProps) {
  const [controller] = useState(() => new CommandController<string>());
  return (
    <>
      <Button
        className={cls.element("create-root-node-button")}
        label="Insert root node"
        onPress={() => controller.send("")}
      />
      <CreateNodeDialog
        commandStream={controller}
        document={document}
        parentId={null}
      />
    </>
  );
}
