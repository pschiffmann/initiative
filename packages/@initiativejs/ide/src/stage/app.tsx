import { Definitions, t } from "@initiativejs/schema";
import { Scene } from "./runtime/index.js";
import { useEditorConnection } from "./use-editor-connection.js";

export interface StageProps<D extends Definitions> {
  definitions: D;
  debugValues: ResolveDebugValueTypes<D>;
}

export function Stage<D extends Definitions>({ definitions }: StageProps<D>) {
  const runtime = useEditorConnection(definitions);
  return runtime ? (
    <Scene runtime={runtime} />
  ) : (
    <div>Connecting to InitiativeJS editor ...</div>
  );
}

type ResolveDebugValueTypes<D extends Definitions> = D extends Definitions<
  infer S
>
  ? { readonly [name in keyof S]: t.Unwrap<S[name]["type"]> }
  : {};
