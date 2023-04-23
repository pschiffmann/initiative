import * as $Object from "@pschiffmann/std/object";
import { ComponentType, createContext, FC } from "react";
import { useNode } from "../scene-document/index.js";
import { useInputValues } from "./bindings.js";
import {
  createOutputsProvider,
  OutputsProviderProps,
} from "./outputs-provider.js";
import { SceneRuntime } from "./scene-runtime.js";
import {
  slotElement,
  SlotElement,
  slotElementWithOutputs,
} from "./slot-element.js";

export function createNodeComponent(
  sceneRuntime: SceneRuntime,
  nodeId: string
): ComponentType {
  const outputsProvider = createOutputsProvider(nodeId);
  const result: FC = () => NodeComponent(sceneRuntime, nodeId, outputsProvider);
  result.displayName = nodeId;
  return result;
}

function NodeComponent(
  sceneRuntime: SceneRuntime,
  nodeId: string,
  OutputsProvider: ComponentType<OutputsProviderProps>
) {
  const nodeJson = useNode(sceneRuntime.sceneDocument, nodeId)!;
  const { schema, component: Component } =
    sceneRuntime.sceneDocument.nodeDefinitions.get(nodeJson.type)!;

  const inputs = useInputValues(nodeJson, schema);

  const errors = sceneRuntime.sceneDocument.getNodeErrors(nodeId);
  if (errors) {
    console.log("early abort because of errors", { nodeId, errors });
    return (
      <div>
        Node '{nodeId}' is incomplete and can't be rendered.
        <br />
        Missing inputs: {errors.missingInputs.size} (
        {[...errors.missingInputs].join(", ")})
        <br />
        Missing slots: {errors.missingSlots.size} (
        {[...errors.missingSlots].join(", ")})
      </div>
    );
  }

  const slots: Record<string, SlotElement | readonly SlotElement[]> =
    $Object.map(schema.slots, (slotName, slotSchema) => {
      const hasOutputs = !!slotSchema.outputs;
      if (schema.isCollectionSlot(slotName)) {
        return nodeJson.collectionSlots[slotName].map<SlotElement>(
          (childNodeId) => ({
            nodeId: childNodeId,
            element: hasOutputs
              ? ({
                  key,
                  ...outputs
                }: { key?: string } & Record<string, unknown> = {}) =>
                  slotElementWithOutputs(
                    sceneRuntime,
                    nodeId,
                    childNodeId,
                    key,
                    outputs
                  )
              : ({ key }: { key?: string } = {}) =>
                  slotElement(sceneRuntime, childNodeId, key),
          })
        );
      } else {
        const childNodeId = nodeJson.slots[slotName];
        return {
          nodeId: childNodeId,
          element: hasOutputs
            ? ({
                key,
                ...outputs
              }: { key?: string } & Record<string, unknown> = {}) =>
                slotElementWithOutputs(
                  sceneRuntime,
                  nodeId,
                  childNodeId,
                  key,
                  outputs
                )
            : ({ key }: { key?: string } = {}) =>
                slotElement(sceneRuntime, childNodeId, key),
        };
      }
    });

  return (
    <Component {...inputs} slots={slots} OutputsProvider={OutputsProvider} />
  );
}

const dummyContext = createContext(undefined);
