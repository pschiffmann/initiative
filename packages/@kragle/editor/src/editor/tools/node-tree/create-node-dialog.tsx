import {
  AlertDialogContent,
  Button,
  Dialog,
  DialogCommand,
  SelectControl,
  TextFieldControl,
  bemClasses,
} from "@kragle/design-system";
import {
  CommandController,
  CommandStream,
  useAcceptCommands,
} from "@kragle/react-command";
import { NodeSchema, SceneDocument, validateNodeId } from "@kragle/runtime";
import { useMemo, useState } from "react";

const cls = bemClasses("kragle-create-node-dialog");

export interface CreateNodeDialogProps {
  commandStream: CommandStream<string>;
  document: SceneDocument;
  parentId: string;
}

export function CreateNodeDialog({
  commandStream,
  document,
  parentId,
}: CreateNodeDialogProps) {
  const [controller] = useState(() => new CommandController<DialogCommand>());
  const [slotName, setSlotName] = useState("");
  useAcceptCommands(commandStream, (slotName) => {
    setSlotName(slotName);
    return controller.send("open");
  });

  const nodeTypes = useMemo(
    () => [...document.definitions.nodes.values()].map((d) => d.schema),
    [document]
  );

  const [nodeType, setNodeType] = useState<NodeSchema | null>(null);
  const [nodeId, setNodeId] = useState("");
  let nodeIdError: string | undefined = undefined;
  if (nodeId) {
    try {
      validateNodeId(nodeId);
      if (document.hasNode(nodeId)) {
        nodeIdError = `A node with id '${nodeId}' already exists.`;
      }
    } catch (e) {
      nodeIdError = e instanceof Error ? e.message : `${e}`;
    }
  }

  function createNode() {
    document.applyPatch({
      type: "create-node",
      nodeType: nodeType!.name,
      parent: { nodeId: parentId, slotName },
      nodeId: nodeId || undefined,
    });
    controller.send("close");
  }

  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <AlertDialogContent
        title="New node"
        actions={
          <>
            <Button label="Cancel" onPress={() => controller.send("close")} />
            <Button
              className={cls.element("create-button")}
              label="Create"
              disabled={!nodeType || !!nodeIdError}
              onPress={createNode}
            />
          </>
        }
      >
        <SelectControl<NodeSchema>
          className={cls.element("node-type-control")}
          label="Node type"
          value={nodeType}
          options={nodeTypes}
          getOptionLabel={(schema) => schema.name}
          noOptionSelectedLabel="Select node type ..."
          onChange={setNodeType}
        />
        <TextFieldControl
          label="Node Id"
          errorText={nodeIdError}
          value={nodeId}
          onChange={setNodeId}
          onClear={() => setNodeId("")}
        />
      </AlertDialogContent>
    </Dialog>
  );
}
