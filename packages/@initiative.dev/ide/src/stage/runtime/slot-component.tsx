import { useNode } from "#shared";
import { NodeSchema, StyleProps } from "@initiative.dev/schema";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { ComponentType, FunctionComponent } from "react";
import { NodeOutputsProvider } from "./ancestor-outputs.js";
import { SceneRuntime } from "./scene-runtime.js";

export interface SlotComponents {
  readonly [slotName: string]:
    | ComponentType<SlotComponentProps>
    | ComponentType<CollectionSlotComponentProps>;
}

export interface SlotComponentProps extends StyleProps, ObjectMap<any> {}

export interface CollectionSlotComponentProps extends SlotComponentProps {
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
    className,
    style,
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
        <ChildAdapter className={className} style={style} />
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
  const result: FunctionComponent<SlotComponentProps> = ({
    className,
    style,
    ...outputs
  }) => {
    const nodeData = useNode(runtime.document, nodeId);
    const ChildAdapter = runtime.getAdapterComponent(nodeData.slots[slotName]);
    return (
      <NodeOutputsProvider
        schema={schema}
        nodeId={nodeId}
        slotName={slotName}
        outputs={outputs}
      >
        <ChildAdapter className={className} style={style} />
      </NodeOutputsProvider>
    );
  };

  result.displayName = `${nodeId}_${slotName}`;
  return result;
}
