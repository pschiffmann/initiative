import { NodeSchema } from "@initiativejs/schema";
import { ReactNode, createContext, useContext } from "react";

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
  schema.forEachOutput((outputName, { type, slot }) => {
    if (slotName !== slot) return;
    mergedOutputs[`${nodeId}::${outputName}`] = outputs[outputName];
  });
  return (
    <AncestorOutputsContext.Provider value={mergedOutputs}>
      {children}
    </AncestorOutputsContext.Provider>
  );
}
