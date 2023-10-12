import { NodeSchema } from "@initiativejs/schema";
import { ObjectMap } from "@pschiffmann/std/object-map";
import { ReactNode, createContext, useContext } from "react";

export class AncestorOutputs {
  constructor(values: ReadonlyMap<string, any>, parent?: AncestorOutputs) {
    this.#parent = parent ?? null;
    this.#values = values;
  }

  #parent: AncestorOutputs | null;
  #values: ReadonlyMap<string, any>;

  getSceneInput(inputName: string): any {
    return this.#lookup(inputName);
  }

  getNodeOutput(nodeId: string, outputName: string): any {
    return this.#lookup(getNodeOutputKey(nodeId, outputName));
  }

  #lookup(key: string): any {
    for (
      let current: AncestorOutputs | null = this;
      current;
      current = current.#parent
    ) {
      if (current.#values.has(key)) return current.#values.get(key);
    }
    throw new Error(`Value '${key}' not found.`);
  }
}

const AncestorOutputsContext = createContext<AncestorOutputs>(null!);

export function useAncestorOutputs(): AncestorOutputs {
  return useContext(AncestorOutputsContext);
}

export interface SceneInputsProviderProps {
  readonly sceneInputs: ReadonlyMap<string, any>;
  readonly children: ReactNode;
}

export function SceneInputsProvider({
  sceneInputs,
  children,
}: SceneInputsProviderProps) {
  return (
    <AncestorOutputsContext.Provider value={new AncestorOutputs(sceneInputs)}>
      {children}
    </AncestorOutputsContext.Provider>
  );
}

export interface NodeOutputsProviderProps {
  readonly schema: NodeSchema;
  readonly nodeId: string;
  readonly slotName?: string;
  readonly outputs: ObjectMap<any>;
  readonly children: ReactNode;
}

export function NodeOutputsProvider({
  schema,
  nodeId,
  slotName,
  outputs,
  children,
}: NodeOutputsProviderProps) {
  const nodeOutputs = new Map<string, any>();
  schema.forEachOutput((outputName, { type, slot }) => {
    if (slotName !== slot) return;
    nodeOutputs.set(getNodeOutputKey(nodeId, outputName), outputs[outputName]);
  });

  const ancestorOutputs = useContext(AncestorOutputsContext);

  return (
    <AncestorOutputsContext.Provider
      value={new AncestorOutputs(nodeOutputs, ancestorOutputs)}
    >
      {children}
    </AncestorOutputsContext.Provider>
  );
}

function getNodeOutputKey(nodeId: string, outputName: string): string {
  return `${nodeId}::${outputName}`;
}
