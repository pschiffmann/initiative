import { useEffect, useState } from "react";

export interface SceneSelectProps {
  kragleDirectory: FileSystemDirectoryHandle;
  onSceneChange(sceneName: string): void;
}

export function SceneSelect({
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

  return (
    <div className="scene-select">
      <div className="scene-select__body">
        {files?.map((file) => (
          <div key={file.name} onClick={() => onSceneChange(file.name)}>
            {file.name}
          </div>
        )) ?? "Loading ..."}
      </div>
    </div>
  );
}
