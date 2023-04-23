import { ComponentType, FC, PropsWithChildren } from "react";
import { OutputValuesProvider } from "./bindings.js";

export type OutputsProviderProps = PropsWithChildren<Record<string, unknown>>;

export function createOutputsProvider(
  nodeId: string
): ComponentType<OutputsProviderProps> {
  const result: FC<OutputsProviderProps> = (props) =>
    OutputsProvider(nodeId, props);
  result.displayName = `${nodeId}OutputsProvider`;
  return result;
}

function OutputsProvider(
  nodeId: string,
  { children, ...outputs }: OutputsProviderProps
) {
  return (
    <OutputValuesProvider nodeId={nodeId} outputs={outputs}>
      {children}
    </OutputValuesProvider>
  );
}
