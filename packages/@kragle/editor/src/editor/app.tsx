import { bemClasses, useColorTheme } from "@kragle/design-system";
import { Definitions, SceneDocument } from "@kragle/runtime/v2";
import { useRef, useState } from "react";
import { LicenseStatus } from "./tools/license-status.js";
import { NodeProperties } from "./tools/node-properties.js";
import { NodeTree } from "./tools/node-tree.js";
import { StageView } from "./tools/stage-view.js";
import { WorkspaceManager } from "./tools/workspace-manager/index.js";

const cls = bemClasses("kragle-editor");

export interface AppProps {
  definitions: Definitions;
}

export function App({ definitions }: AppProps) {
  const [document, setDocument] = useState<SceneDocument | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  useColorTheme(rootRef);

  return (
    <div ref={rootRef} className={cls.block()}>
      <WorkspaceManager
        className={cls.element("workspace-manager")}
        document={document}
        onDocumentChange={setDocument}
      />
      <NodeTree className={cls.element("node-tree")} />
      <StageView className={cls.element("stage-view")} />
      <NodeProperties className={cls.element("node-properties")} />
      <LicenseStatus className={cls.element("license-status")} />
    </div>
  );
}
