import {
  NodeDefinitions,
  SceneDocument,
  parseSceneJson,
} from "@kragle/runtime";
import { useEffect, useState } from "react";

export interface SceneSelectProps {
  nodeDefinitions: NodeDefinitions;
  kragleDirectory: FileSystemDirectoryHandle;
  onSceneChange(sceneDocument: SceneDocument): void;
}

export function SceneSelect({
  nodeDefinitions,
  kragleDirectory,
  onSceneChange,
}: SceneSelectProps) {
  const [files, setFiles] = useState<readonly FileSystemFileHandle[]>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const files = [];
      for await (const handle of kragleDirectory.values()) {
        if (handle.kind === "file" && handle.name.endsWith(".json")) {
          files.push(handle);
        }
      }
      if (!cancelled) setFiles(files);
    })();

    return () => {
      cancelled = true;
      setFiles(undefined);
    };
  }, [kragleDirectory]);

  async function openSceneDocument(fileHandle: FileSystemFileHandle) {
    try {
      const file = await fileHandle.getFile();
      const textContent = await file.text();
      const sceneJson = JSON.parse(textContent);
      const { sceneDocument, errors } = parseSceneJson(
        new SceneDocument(nodeDefinitions, true),
        sceneJson
      );
      if (errors.length) {
        alert(
          "Encountered the following errors during parsing:\n" +
            errors.join("\n")
        );
      }
      onSceneChange(sceneDocument);
    } catch (e) {
      alert("An error occured while loading the file. Check the dev tools.");
      throw e;
    }
  }

  return (
    <div className="scene-select">
      <div className="scene-select__body">
        {files?.map((file) => (
          <div key={file.name} onClick={() => openSceneDocument(file)}>
            {file.name}
          </div>
        )) ?? "Loading ..."}
      </div>
    </div>
  );
}
