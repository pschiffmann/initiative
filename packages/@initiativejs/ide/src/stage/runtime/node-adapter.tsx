import { NodeData } from "#shared";
import { Definitions, NodeSchema } from "@initiativejs/schema";
import * as $Object from "@pschiffmann/std/object";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { ComponentType, FunctionComponent } from "react";
import { useNode } from "../../shared/use-scene-document.js";
import { NodeOutputsProvider, useAncestorOutputs } from "./ancestor-outputs.js";
import { ErrorComponent } from "./error-component.js";
import { evaluateExpression } from "./evaluate-expression.js";
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
      <ErrorComponent
        title={`Error in node '${nodeId}':`}
        details={[
          ...[...nodeData.errors.invalidInputs].map(
            (inputKey) => `Input '${inputKey}' has invalid value.`,
          ),
          ...[...nodeData.errors.missingSlots].map(
            (slotName) => `Slot '${slotName}' is required.`,
          ),
        ]}
      />
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
  const result: FunctionComponent<ObjectMap<any>> = ({
    children,
    ...outputs
  }) => {
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
  const ancestorOutputs = useAncestorOutputs();

  const inputs: Record<string, any> = {};
  nodeData.forEachInput((expr, attributes, inputName, index) => {
    const value =
      expr && !expr.hasErrors
        ? evaluateExpression(expr, definitions, null, ancestorOutputs)
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
      | ComponentType<ObjectMap<any>>
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
