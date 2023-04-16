import * as $Object from "@pschiffmann/std/object";
import { createContext, FC, ReactNode, useContext } from "react";
import { SceneRuntime } from "./scene-runtime.js";

export interface NodeAdapterProps {
  nodeId: string;
  runtime: SceneRuntime;
}

export function NodeAdapter({ nodeId, runtime }: NodeAdapterProps) {
  const nodeJson = runtime.sceneJson.nodes[nodeId] as any;
  const { component: Component, spec } = runtime.nodeRefs.get(nodeJson.type)!;
  const inputs = useInputs(
    Object.keys(spec.inputs ?? {}),
    runtime,
    nodeJson.inputs ?? {}
  );
  const OutputsProvider = runtime.getOutputsProviderComponent(nodeId);

  return <Component OutputsProvider={OutputsProvider} {...inputs} />;
}

function useInputs(
  inputNames: readonly string[],
  sceneRuntime: SceneRuntime,
  bindings: Readonly<Record<string, string>>
) {
  const inputs: Record<string, unknown> = {};
  for (const inputName of inputNames) {
    const binding = bindings[inputName];
    inputs[inputName] = useContext(
      binding
        ? sceneRuntime.getContextForNodeOutput(binding)
        : unboundInputContext
    );
    if (binding?.startsWith("constant::")) {
      const [, constantId] = binding.split("::");
      inputs[inputName] = (sceneRuntime.sceneJson as any).constants![
        constantId
      ];
    }
  }
  return inputs;
}

const unboundInputContext = createContext<unknown>(undefined);

interface OutputsProviderProps {
  nodeId: string;
  runtime: SceneRuntime;
  children?(slots: Record<string, FC>): ReactNode;
  [outputName: string]: unknown;
}

export function OutputsProvider({
  nodeId,
  runtime,
  children,
  ...outputs
}: OutputsProviderProps) {
  const { type, slots } = runtime.sceneJson.nodes[nodeId];
  const { spec } = runtime.nodeRefs.get(type)!;

  let result =
    typeof children === "function" ? (
      <>
        {children(
          $Object.map(slots ?? {}, (slot, nodeId) =>
            runtime.getAdapterComponent(nodeId)
          )
        )}
      </>
    ) : (
      <>
        {slots &&
          Object.entries(slots).map(([slot, nodeId]) => {
            const NodeAdapter = runtime.getAdapterComponent(nodeId);
            return <NodeAdapter key={slot} />;
          })}
      </>
    );

  for (const outputName of Object.keys(spec.outputs ?? {})) {
    const Context = runtime.getContextForNodeOutput(`${nodeId}::${outputName}`);
    result = (
      <Context.Provider value={outputs[outputName]}>{result}</Context.Provider>
    );
  }
  return result;
}
