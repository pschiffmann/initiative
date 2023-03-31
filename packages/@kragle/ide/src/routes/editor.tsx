import { useState } from "react";
import { BindingsInspector } from "../tools/bindings-inspector.js";
import { NodeEditor } from "../tools/node-editor.js";
import { NodeTree } from "../tools/node-tree.js";
import { SceneViewer } from "../tools/scene-viewer.js";

export interface EditorProps {
  kragleDirectory: FileSystemDirectoryHandle;
  sceneName: string;
  onSceneClose(): void;
}

export function Editor({
  kragleDirectory,
  sceneName,
  onSceneClose,
}: EditorProps) {
  const [visible, setVisible] = useState(() => [true, true, true, false]);

  return (
    <div className="editor">
      <div className="editor__header">
        <button onClick={onSceneClose}>Close scene</button>
        <button>Save</button>
        <div />

        {toolLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              const v = [...visible];
              v[i] = !visible[i];
              setVisible(v);
            }}
          >
            {`${label}: ${visible[i] ? "visible" : "hidden"}`}
          </button>
        ))}
      </div>

      <div className="editor__tools">
        {visible[0] && <NodeTree />}
        {visible[1] && <SceneViewer />}
        {visible[2] && <NodeEditor />}
        {visible[3] && <BindingsInspector />}
      </div>
    </div>
  );
}

const toolLabels = [
  "Node tree",
  "Scene viewer",
  "Node editor",
  "Bindings inspector",
];
