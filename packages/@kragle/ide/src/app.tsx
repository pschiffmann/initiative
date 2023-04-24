import { NodeDefinitions, SceneDocument } from "@kragle/runtime";
import { useState } from "react";
import { DirectorySelect } from "./routes/directory-select.js";
import { Editor } from "./routes/editor.js";
import { SceneSelect } from "./routes/scene-select.js";

export interface AppProps {
  nodeDefinitions: NodeDefinitions;
}

export function App({ nodeDefinitions }: AppProps) {
  const [kragleDirectory, setKragleDirectory] =
    useState<FileSystemDirectoryHandle>();
  const [sceneDocument, setSceneDocument] = useState<SceneDocument>();

  return !kragleDirectory ? (
    <DirectorySelect onDirectoryChange={setKragleDirectory} />
  ) : !sceneDocument ? (
    <SceneSelect
      nodeDefinitions={nodeDefinitions}
      kragleDirectory={kragleDirectory}
      onSceneChange={setSceneDocument}
    />
  ) : (
    <Editor
      nodeDefinitions={nodeDefinitions}
      sceneDocument={sceneDocument}
      onSceneClose={() => setSceneDocument(undefined)}
    />
  );
}
