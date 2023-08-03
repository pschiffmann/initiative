import { ComponentType, FunctionComponent } from "react";
import { NodeSchema } from "../definitions/index.js";
import { NodeOutputs, NodeOutputsProvider } from "./node-outputs.js";
import { SceneRuntime } from "./scene-runtime.js";
import { useNode } from "./use-scene-document.js";

export interface SlotComponents {
  readonly [slotName: string]:
    | ComponentType<NodeOutputs>
    | ComponentType<CollectionSlotComponentProps>;
}

export interface CollectionSlotComponentProps extends NodeOutputs {
  readonly index: number;
}

export function createSlotComponents(
  runtime: SceneRuntime,
  nodeId: string,
): SlotComponents {
  const { schema } = runtime.document.getNode(nodeId);
  return Object.fromEntries(
    schema.forEachSlot((slotName, { isCollectionSlot }) => {
      const component = isCollectionSlot
        ? createCollectionSlotComponent(runtime, schema, nodeId, slotName)
        : createSlotComponent(runtime, schema, nodeId, slotName);
      return [slotName, component];
    }),
  );
}

function createCollectionSlotComponent(
  runtime: SceneRuntime,
  schema: NodeSchema,
  nodeId: string,
  slotName: string,
) {
  const result: FunctionComponent<CollectionSlotComponentProps> = ({
    index,
    ...outputs
  }) => {
    const nodeData = useNode(runtime.document, nodeId);
    const childId = nodeData.slots[`${slotName}::${index}`];
    if (!childId) {
      throw new Error(
        `Invalid index '${index}' for slot '${slotName}' of node '${nodeId}'.`,
      );
    }
    const ChildAdapter = runtime.getAdapterComponent(childId);
    return (
      <NodeOutputsProvider
        schema={schema}
        nodeId={nodeId}
        slotName={slotName}
        outputs={outputs}
      >
        <ChildAdapter />
      </NodeOutputsProvider>
    );
  };

  result.displayName = `${nodeId}_${slotName}`;
  return result;
}

function createSlotComponent(
  runtime: SceneRuntime,
  schema: NodeSchema,
  nodeId: string,
  slotName: string,
) {
  const result: FunctionComponent<NodeOutputs> = (outputs) => {
    const nodeData = useNode(runtime.document, nodeId);
    const ChildAdapter = runtime.getAdapterComponent(nodeData.slots[slotName]);
    return (
      <NodeOutputsProvider
        schema={schema}
        nodeId={nodeId}
        slotName={slotName}
        outputs={outputs}
      >
        <ChildAdapter />
      </NodeOutputsProvider>
    );
  };

  result.displayName = `${nodeId}_${slotName}`;
  return result;
}
