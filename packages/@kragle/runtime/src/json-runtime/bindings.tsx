import { ReactNode, createContext, useContext } from "react";
import { AnyNodeSchema } from "../node-schema.js";
import { InputBindingJson, NodeJson } from "../scene-document/index.js";

const OutputValuesContext = createContext<OutputValues>({});

export interface OutputValuesProviderProps {
  nodeId: string;
  outputs: Readonly<Record<string, unknown>>;
  children: ReactNode;
}

export function OutputValuesProvider({
  nodeId,
  outputs,
  children,
}: OutputValuesProviderProps) {
  const ancestorOutputValues = useContext(OutputValuesContext);

  const mergedOutputValues = { ...ancestorOutputValues };
  for (const [outputName, value] of Object.entries(outputs)) {
    mergedOutputValues[generateNodeOutputId(nodeId, outputName)] = value;
  }

  return (
    <OutputValuesContext.Provider value={mergedOutputValues}>
      {children}
    </OutputValuesContext.Provider>
  );
}

export function useInputValues(nodeJson: NodeJson, schema: AnyNodeSchema) {
  const ancestorOutputValues = useContext(OutputValuesContext);
  return resolveInputValues(nodeJson, schema, ancestorOutputValues);
}

function resolveInputValues(
  nodeJson: NodeJson,
  schema: AnyNodeSchema,
  ancestorOutputValues: OutputValues
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const inputName of Object.keys(schema.inputs)) {
    result[inputName] = resolveInputValue(
      nodeJson.inputs[inputName],
      ancestorOutputValues
    );
  }
  for (const [slotName, slotSchema] of Object.entries(schema.slots)) {
    if (!slotSchema.inputs) continue;
    const children = nodeJson.collectionSlots[slotName];
    for (const inputName of Object.keys(slotSchema.inputs)) {
      result[inputName] = children.map((_, i) =>
        resolveInputValue(
          nodeJson.collectionInputs[inputName][i],
          ancestorOutputValues
        )
      );
    }
  }

  return result;
}

function resolveInputValue(
  binding: InputBindingJson | null | undefined,
  ancestorOutputValues: OutputValues
): unknown {
  switch (binding?.type) {
    case "node-output":
      return ancestorOutputValues[`${binding.nodeId}/${binding.outputName}`];
    case "constant":
      return binding.value;
  }
}

type OutputValues = Readonly<Record<string, unknown>>;

function generateNodeOutputId(nodeId: string, outputName: string): string {
  return `${nodeId}/${outputName}`;
}
