import { NodeDefinitions, SceneDocument } from "@kragle/runtime";
import { ReactNode, useState } from "react";
import { NodeBindingsEditor } from "../tools/node-bindings-editor/index.js";
import { NodeTree } from "../tools/node-tree/index.js";
import { StageView } from "../tools/stage-view.js";

declare module "csstype" {
  interface Properties {
    "--tool-size"?: number;
  }
}

export interface EditorProps {
  nodeDefinitions: NodeDefinitions;
  sceneDocument: SceneDocument;
  onSceneClose(): void;
}

export function Editor({
  nodeDefinitions,
  sceneDocument,
  onSceneClose,
}: EditorProps) {
  const [activeTool, setActiveTool] = useState<"node-tree" | "node-bindings">(
    "node-tree"
  );

  const [[toolWidth, sceneViewerWidth], setLayout] = useState<
    [toolWidth: number, sceneViewerWidth: number]
  >([1, 2]);

  return (
    <div className="editor">
      <div className="editor__header">
        <button onClick={onSceneClose}>Close scene</button>
        <button disabled>Save</button>
      </div>

      <div className="editor__tools">
        {activeTool === "node-tree" ? (
          <ToolFrame
            title="Node tree"
            headerAction={
              <button onClick={() => setActiveTool("node-bindings")}>
                Show node bindings
              </button>
            }
            size={toolWidth}
          >
            <NodeTree document={sceneDocument} />
          </ToolFrame>
        ) : (
          <ToolFrame
            title="Node bindings editor"
            headerAction={
              <button onClick={() => setActiveTool("node-tree")}>
                Show node tree
              </button>
            }
            size={toolWidth}
          >
            <NodeBindingsEditor document={sceneDocument} />
          </ToolFrame>
        )}

        <div className="editor__layout-buttons">
          <button
            className="editor__layout-button"
            disabled={!toolWidth}
            onClick={() => setLayout([toolWidth - 1, sceneViewerWidth + 1])}
          >
            ←
          </button>
          <button
            className="editor__layout-button"
            disabled={!sceneViewerWidth}
            onClick={() => setLayout([toolWidth + 1, sceneViewerWidth - 1])}
          >
            →
          </button>
        </div>

        <ToolFrame title="Stage" size={sceneViewerWidth}>
          <StageView sceneDocument={sceneDocument} />
        </ToolFrame>
      </div>
    </div>
  );
}

interface ToolFrameProps {
  title: string;
  headerAction?: ReactNode;
  size: number;
  children: ReactNode;
}

function ToolFrame({ title, headerAction, size, children }: ToolFrameProps) {
  return (
    <div
      className="editor__tool"
      style={{
        "--tool-size": size,
        display: size ? "grid" : "none",
      }}
    >
      <div className="editor__tool-title">{title}</div>
      {headerAction && (
        <div className="editor__tool-action">{headerAction}</div>
      )}
      <div className="editor__tool-content">{children}</div>
    </div>
  );
}
