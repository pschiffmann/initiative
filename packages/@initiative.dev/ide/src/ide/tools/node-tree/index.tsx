import { Button, DialogCommand, IconButton, bemClasses } from "#design-system";
import {
  ComponentNodeJson,
  SceneDocument,
  SlotNodeData,
  SlotNodeJson,
  useComponentNode,
  useNode,
  useRootNodeId,
} from "#shared";
import { CommandController } from "@initiative.dev/react-command";
import { SetStateAction, useCallback, useState } from "react";
import { DataFlowInspector } from "../data-flow-inspector/index.js";
import { ToolFrame } from "../tool-frame.js";
import { CreateNodeDialog } from "./create-node-dialog.js";
import { NodeTreeElement } from "./node-tree-element.js";

const cls = bemClasses("initiative-node-tree");

export interface NodeTreeProps {
  document: SceneDocument;
  selectedNodeId: string | null;
  onSelectedNodeChange(nodeId: string | null): void;
  className?: string;
  toggleHidden(): void;
}

export function NodeTree({
  document,
  selectedNodeId,
  onSelectedNodeChange,
  className,
  toggleHidden,
}: NodeTreeProps) {
  const rootNodeId = useRootNodeId(document);
  const selectedNode = useNode(document, selectedNodeId, false);
  const parentNode = useComponentNode(
    document,
    selectedNode?.parent?.nodeId ?? null,
    false,
  );

  const testCopy = useCallback(() => {
    if (!selectedNodeId) return;
    const target = document.getNode(selectedNodeId).id;

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
  }, [selectedNodeId]);

  const moveSelectedNodeUp = useCallback(() => {
    document.applyPatch({
      type: "move-node",
      nodeId: selectedNode!.id,
      parent: {
        ...selectedNode!.parent!,
        index: selectedNode!.parent!.index! - 1,
      },
    });
  }, [document, selectedNode]);

  const moveSelectedNodeDown = useCallback(() => {
    document.applyPatch({
      type: "move-node",
      nodeId: selectedNode!.id,
      parent: {
        ...selectedNode!.parent!,
        index: selectedNode!.parent!.index! + 1,
      },
    });
  }, [document, selectedNode]);

  const renameSelectedNode = useCallback(() => {
    const newId = prompt("Enter new node id");
    if (!newId) return;
    try {
      document.applyPatch({
        type: "rename-node",
        nodeId: selectedNodeId!,
        newId,
      });
      onSelectedNodeChange(newId);
    } catch (e) {
      alert(`${e}`);
    }
  }, [document, selectedNodeId]);

  const deleteSelectedNode = useCallback(() => {
    if (confirm(`Delete node ${selectedNodeId}?`)) {
      onSelectedNodeChange(null);
      document.applyPatch({ type: "delete-node", nodeId: selectedNodeId! });
    }
  }, [document, selectedNodeId]);

  return (
    <ToolFrame
      className={cls.block(className)}
      title="Nodes"
      actions={
        <>
          <IconButton
            label="Move up"
            icon="keyboard_arrow_up"
            disabled={
              !selectedNode ||
              selectedNode.parent?.index === undefined ||
              selectedNode.parent.index === 0
            }
            onPress={moveSelectedNodeUp}
          />
          <IconButton
            label="Move down"
            icon="keyboard_arrow_down"
            disabled={
              !selectedNode ||
              selectedNode.parent?.index === undefined ||
              selectedNode.parent.index ===
                parentNode!.collectionSlotSizes[selectedNode.parent.slotName] -
                  1
            }
            onPress={moveSelectedNodeDown}
          />
          <IconButton
            label="Copy to clipboard"
            icon="content_copy"
            disabled={!selectedNodeId}
            onPress={testCopy}
          />
          <IconButton
            label="Rename node"
            icon="edit"
            disabled={!selectedNodeId}
            onPress={renameSelectedNode}
          />
          <IconButton
            label="Delete node"
            icon="delete"
            disabled={!selectedNodeId}
            onPress={deleteSelectedNode}
          />
          <IconButton
            label="Inspect data flow"
            icon="polyline"
            onPress={toggleHidden}
          />
        </>
      }
    >
      {rootNodeId !== null ? (
        <div className={cls.element("nodes")}>
          <NodeTreeElement
            document={document}
            selectedNode={selectedNodeId}
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
