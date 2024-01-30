import { Button, DialogCommand, IconButton, bemClasses } from "#design-system";
import {
  ComponentNodeJson,
  SceneDocument,
  SlotNodeData,
  SlotNodeJson,
  useRootNodeId,
} from "#shared";
import { CommandController } from "@initiative.dev/react-command";
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

  const testCopy = useCallback(() => {
    if (!selectedNode) return;
    const target = document.getNode(selectedNode).id;

    function recursiveCollect(
      target: string,
    ): Record<string, ComponentNodeJson | SlotNodeJson> {
      let result: Record<string, ComponentNodeJson | SlotNodeJson> = {};
      const node = document.getNode(target);
      result[node.id] = node.toJson();
      if (node instanceof SlotNodeData) return result;
      if (Object.keys(node.slots).length === 0) return result;
      for (const [slot, id] of Object.entries(node.slots)) {
        result = { ...result, ...recursiveCollect(id) };
      }
      return result;
    }

    navigator.clipboard.writeText(
      JSON.stringify(recursiveCollect(target), null, 2),
    );
  }, [selectedNode]);

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
            label="Copy node"
            icon="content_copy"
            disabled={!selectedNode}
            onPress={testCopy}
          />
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
          <DataFlowInspector
            controller={dataFlowInspectorController}
            document={document}
            selectedNode={selectedNode}
            onSelectedNodeChange={onSelectedNodeChange}
          />
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
