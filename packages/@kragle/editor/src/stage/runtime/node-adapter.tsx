import { Definitions, NodeData, NodeSchema } from "@kragle/runtime";
import * as $Object from "@pschiffmann/std/object";
import { ComponentType, FunctionComponent, useContext } from "react";
import { useNode } from "../../shared/use-scene-document.js";
import { ErrorComponent } from "./error-component.js";
import { evaluateExpression } from "./evaluate-expression.js";
import {
  AncestorOutputsContext,
  NodeOutputs,
  NodeOutputsProvider,
} from "./node-outputs.js";
import { SceneRuntime } from "./scene-runtime.js";
import {
  CollectionSlotComponentProps,
  SlotComponents,
  createSlotComponents,
} from "./slot-component.js";

export function createNodeAdapterComponent(
  runtime: SceneRuntime,
  nodeId: string,
) {
  const document = runtime.document;
  const nodeData = document.getNode(nodeId);
  const OutputsProvider = nodeData.schema.hasRegularOutputs()
    ? createOutputsProviderComponent(nodeData.schema, nodeId)
    : undefined;
  const slotComponents = nodeData.schema.hasSlots()
    ? createSlotComponents(runtime, nodeId)
    : undefined;
  const NodeImpl = document.definitions.getNode(nodeData.type).component;

  const result: FunctionComponent<any> = () => {
    const nodeData = useNode(document, nodeId);
    const inputs = useInputs(document.definitions, nodeData);
    const slots = slotComponents && useSlotsPropValue(slotComponents, nodeData);
    return nodeData.errors ? (
      <ErrorComponent nodeData={nodeData} />
    ) : OutputsProvider ? (
      <NodeImpl OutputsProvider={OutputsProvider} slots={slots} {...inputs} />
    ) : (
      <NodeImpl slots={slots} {...inputs} />
    );
  };
  result.displayName = `${nodeId}_Adapter`;
  return result;
}

export function createOutputsProviderComponent(
  schema: NodeSchema,
  nodeId: string,
) {
  const result: FunctionComponent<NodeOutputs> = ({ children, ...outputs }) => {
    return (
      <NodeOutputsProvider schema={schema} nodeId={nodeId} outputs={outputs}>
        {children}
      </NodeOutputsProvider>
    );
  };

  result.displayName = `${nodeId}_OutputsProvider`;
  return result;
}

function useInputs(definitions: Definitions, nodeData: NodeData) {
  const ancestorOutputs = useContext(AncestorOutputsContext);

  const inputs: Record<string, any> = {};
  nodeData.forEachInput((expression, type, inputName, index) => {
    const value =
      expression && expression.errors.size === 0
        ? evaluateExpression(expression.json, definitions, ancestorOutputs)
        : undefined;
    if (index === undefined) {
      inputs[inputName] = value;
    } else {
      const values = (inputs[inputName] ??= []);
      if (index !== -1) values.push(value);
    }
  });

  return inputs;
}

interface SlotPropValue {
  readonly [slotName: string]: {
    readonly size?: number;
    readonly Component:
      | ComponentType<NodeOutputs>
      | ComponentType<CollectionSlotComponentProps>;
  };
}

function useSlotsPropValue(
  slotComponents: SlotComponents,
  nodeData: NodeData,
): SlotPropValue {
  return $Object.map(slotComponents, (slotName, Component) => ({
    size: nodeData.collectionSlotSizes[slotName],
    Component,
  }));
}
