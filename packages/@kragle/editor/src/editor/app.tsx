import { bemClasses, useColorTheme } from "@kragle/design-system";
import { Definitions } from "@kragle/runtime/v2";
import { useRef } from "react";
import { LicenseStatus } from "./tools/license-status.js";
import { NodeProperties } from "./tools/node-properties.js";
import { NodeTree } from "./tools/node-tree.js";
import { SceneManager } from "./tools/scene-manager.js";
import { StageView } from "./tools/stage-view.js";

const cls = bemClasses("kragle-editor");

export interface AppProps {
  definitions: Definitions;
}

export function App({ definitions }: AppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useColorTheme(rootRef);

  return (
    <div ref={rootRef} className={cls.block()}>
      <SceneManager className={cls.element("scene-manager")} />
      <NodeTree className={cls.element("node-tree")} />
      <StageView className={cls.element("stage-view")} />
      <NodeProperties className={cls.element("node-properties")} />
      <LicenseStatus className={cls.element("license-status")} />
    </div>
  );
}
