import { Definitions } from "@initiativejs/schema";
import { Scene } from "./runtime/index.js";
import { useEditorConnection } from "./use-editor-connection.js";

export interface StageProps {
  definitions: Definitions;
}

export function Stage({ definitions }: StageProps) {
  const runtime = useEditorConnection(definitions);
  return runtime ? (
    <Scene runtime={runtime} />
  ) : (
    <div>Connecting to InitiativeJS editor ...</div>
  );
}
