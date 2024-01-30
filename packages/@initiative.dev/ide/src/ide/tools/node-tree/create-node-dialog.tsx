import {
  AlertDialogContent,
  Button,
  Dialog,
  DialogCommand,
  IconButton,
  SelectControl,
  TextFieldControl,
  bemClasses,
} from "#design-system";
import { ComponentNodeJson, SceneDocument, SlotNodeJson } from "#shared";
import {
  CommandController,
  CommandStream,
  useAcceptCommands,
} from "@initiative.dev/react-command";
import { NodeSchema, validateNodeId } from "@initiative.dev/schema";
import { useCallback, useMemo, useState } from "react";

const cls = bemClasses("initiative-create-node-dialog");

export interface CreateNodeDialogProps {
  commandStream: CommandStream<string>;
  document: SceneDocument;
  parentId: string | null;
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
    [document],
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
      type: "create-component-node",
      nodeType: nodeType!.name,
      parent: parentId ? { nodeId: parentId, slotName } : undefined,
      nodeId: nodeId || undefined,
    });
    controller.send("close");
  }

  const testPaste = useCallback(() => {
    //TODO:
    // support mutiple base node strings
    // support incorrectly formated strings
    // support incorrect strings?
    const x = navigator.clipboard.readText().then(function (data) {
      const errors: string[] = [];

      //console.log(data);
      const bin: Record<string, ComponentNodeJson | SlotNodeJson> =
        JSON.parse(data);
      console.log(bin);

      const pasteTreeParent: Map<string, string> = new Map();
      const pasteTreeSlot: Map<string, string> = new Map();
      const pasteTrueSelf: Map<string, string> = new Map();
      //nodes
      for (const id of Object.keys(bin)) {
        const finalId: string = document.hasNode(id)
          ? document.generateNodeId(id)
          : id;
        pasteTrueSelf.set(id, finalId);

        if (bin[id].type === "SceneSlot") {
          document.applyPatch({
            type: "create-slot-node",
            debugPreview: (bin[id] as SlotNodeJson).debugPreview,
            parent: pasteTreeParent.has(id)
              ? {
                  nodeId: pasteTreeParent.get(id)!,
                  slotName: pasteTreeSlot.get(id)!,
                }
              : parentId
              ? { nodeId: parentId, slotName }
              : undefined,
            nodeId: finalId,
          });
          continue;
        }

        for (const [childSlot, childId] of Object.entries(
          (bin[id] as ComponentNodeJson).slots,
        )) {
          pasteTreeParent.set(childId, finalId);
          pasteTreeSlot.set(childId, childSlot.split("::")[0]);
        }

        document.applyPatch({
          type: "create-component-node",
          nodeType: bin[id].type,
          parent: pasteTreeParent.has(id)
            ? {
                nodeId: pasteTreeParent.get(id)!,
                slotName: pasteTreeSlot.get(id)!,
              }
            : parentId
            ? { nodeId: parentId, slotName }
            : undefined,
          nodeId: finalId,
        });
      }
      //inputs
      for (const [id, node] of Object.entries(bin)) {
        if (node.type === "SceneSlot") continue;
        for (const [input, connection] of Object.entries(
          (node as ComponentNodeJson).inputs,
        )) {
          try {
            document.applyPatch({
              type: "set-component-node-input",
              nodeId: pasteTrueSelf.get(id)!,
              expression:
                connection.type === "node-output"
                  ? {
                      type: connection.type,
                      nodeId:
                        pasteTrueSelf.get(connection.nodeId) ??
                        connection.nodeId,
                      outputName: connection.outputName,
                      selectors: connection.selectors,
                    }
                  : connection,
              inputName: input.split("::")[0],
              index: Number(input.split("::")[1]),
            });
          } catch (e) {
            errors.push(`- ${e}`);
          }
        }
      }

      if (errors.length !== 0) {
        window.alert("Encountered errors during import\n" + errors.join("\n"));
      }
    });

    controller.send("close");
  }, [slotName]);

  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <AlertDialogContent
        title="New node"
        actions={
          <>
            <IconButton
              label="Paste node"
              icon="content_paste"
              disabled={false}
              onPress={testPaste}
            />
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
