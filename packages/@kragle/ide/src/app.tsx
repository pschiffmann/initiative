import { useState } from "react";
import { DirectorySelect } from "./routes/directory-select.js";
import { Editor } from "./routes/editor.js";
import { SceneSelect } from "./routes/scene-select.js";

export interface AppProps {
  nodes: any;
}

export function App({ nodes }: AppProps) {
  const [kragleDirectory, setKragleDirectory] =
    useState<FileSystemDirectoryHandle>();
  const [sceneName, setSceneName] = useState<string>();

  return !kragleDirectory ? (
    <DirectorySelect onDirectoryChange={setKragleDirectory} />
  ) : !sceneName ? (
    <SceneSelect
      kragleDirectory={kragleDirectory}
      onSceneChange={setSceneName}
    />
  ) : (
    <Editor
      kragleDirectory={kragleDirectory}
      sceneName={sceneName}
      onSceneClose={() => setSceneName(undefined)}
    />
  );
}
