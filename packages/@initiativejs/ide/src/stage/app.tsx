import { Definitions, t } from "@initiativejs/schema";
import { RootScene } from "./runtime/root-scene.js";
import { useEditorConnection } from "./use-editor-connection.js";

export interface StageProps<D extends Definitions> {
  definitions: D;
  debugValues: ResolveDebugValueTypes<D>;
}

export function Stage<D extends Definitions>({
  definitions,
  debugValues,
}: StageProps<D>) {
  const runtime = useEditorConnection(definitions);
  return runtime ? (
    <RootScene runtime={runtime} debugValues={debugValues} />
  ) : (
    <div>Connecting to InitiativeJS editor ...</div>
  );
}

type ResolveDebugValueTypes<D extends Definitions> = D extends Definitions<
  infer S
>
  ? { readonly [name in keyof S]: t.Unwrap<S[name]["type"]> }
  : {};
