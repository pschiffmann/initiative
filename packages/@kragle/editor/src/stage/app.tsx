import { Definitions, Scene } from "@kragle/runtime";
import { useEditorConnection } from "./use-editor-connection.js";

export interface StageProps {
  definitions: Definitions;
}

export function Stage({ definitions }: StageProps) {
  const runtime = useEditorConnection(definitions);
  return runtime ? (
    <Scene runtime={runtime} />
  ) : (
    <div>Connecting to Kragle editor ...</div>
  );
}
