import { Definitions, StyleProps, t } from "@initiative.dev/schema";
import { LocaleContext } from "./runtime/context.js";
import { RootScene } from "./runtime/root-scene.js";
import { useEditorConnection } from "./use-editor-connection.js";

export interface StageProps<D extends Definitions> extends StyleProps {
  definitions: D;
  debugValues: ResolveDebugValueTypes<D>;
}

export function Stage<D extends Definitions>({
  definitions,
  debugValues,
  className,
  style,
}: StageProps<D>) {
  const { runtime, locale } = useEditorConnection(definitions);
  return runtime ? (
    <LocaleContext.Provider value={locale}>
      <RootScene
        className={className}
        style={style}
        runtime={runtime}
        debugValues={debugValues}
      />
    </LocaleContext.Provider>
  ) : (
    <div>Connecting to InitiativeJS editor ...</div>
  );
}

type ResolveDebugValueTypes<D extends Definitions> = D extends Definitions<
  infer S
>
  ? { readonly [name in keyof S]: t.Unwrap<S[name]["type"]> }
  : {};
