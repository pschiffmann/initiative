import { ReactNode, createContext, useContext } from "react";
import { NodeSchema } from "../definitions/index.js";

export type NodeOutputs = { readonly [outputName: string]: any };
export type AncestorOutputs = { readonly [outputId: string]: any };

export const AncestorOutputsContext = createContext<AncestorOutputs>({});

export interface NodeOutputsProviderProps {
  readonly schema: NodeSchema;
  readonly nodeId: string;
  readonly slotName?: string;
  readonly outputs: NodeOutputs;
  readonly children: ReactNode;
}

export function NodeOutputsProvider({
  schema,
  nodeId,
  slotName,
  outputs,
  children,
}: NodeOutputsProviderProps) {
  const ancestorOutputs = useContext(AncestorOutputsContext);
  const mergedOutputs = { ...ancestorOutputs };
  schema.forEachOutput((type, outputName, slotName2) => {
    if (slotName !== slotName2) return;
    mergedOutputs[`${nodeId}::${outputName}`] = outputs[outputName];
  });
  return (
    <AncestorOutputsContext.Provider value={mergedOutputs}>
      {children}
    </AncestorOutputsContext.Provider>
  );
}
