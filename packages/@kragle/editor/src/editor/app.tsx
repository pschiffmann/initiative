import { bemClasses, useColorTheme } from "@kragle/design-system";
import { Definitions, SceneDocument } from "@kragle/runtime/v2";
import { useRef, useState } from "react";
import { LicenseStatus } from "./tools/license-status.js";
import { NodeInputs } from "./tools/node-inputs/index.js";
import { NodeTree } from "./tools/node-tree/index.js";
import { StageView } from "./tools/stage-view.js";
import { WorkspaceManager } from "./tools/workspace-manager/index.js";

const cls = bemClasses("kragle-editor");

export interface AppProps {
  definitions: Definitions;
}

export function App({ definitions }: AppProps) {
  const [document, setDocument] = useState<SceneDocument | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  useColorTheme(rootRef);

  return (
    <div ref={rootRef} className={cls.block()}>
      <WorkspaceManager
        className={cls.element("workspace-manager")}
        definitions={definitions}
        document={document}
        onDocumentChange={setDocument}
      />
      {document ? (
        <>
          <NodeTree
            className={cls.element("node-tree")}
            document={document}
            selectedNode={selectedNode}
            onSelectedNodeChange={setSelectedNode}
          />
          <StageView
            className={cls.element("stage-view")}
            document={document}
          />
          <NodeInputs
            className={cls.element("node-inputs")}
            document={document}
            selectedNode={selectedNode}
          />
        </>
      ) : (
        <>
          <EmptyTool position="node-tree" />
          <EmptyTool position="stage-view" />
          <EmptyTool position="node-inputs" />
        </>
      )}
      <LicenseStatus className={cls.element("license-status")} />
    </div>
  );
}

interface EmptyToolProps {
  position: string;
}

function EmptyTool({ position }: EmptyToolProps) {
  return (
    <div className={cls.element("empty-tool", null, position)}>
      No scene selected.
    </div>
  );
}
