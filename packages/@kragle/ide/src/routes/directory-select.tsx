import { get, set } from "idb-keyval";
import { useEffect, useState } from "react";

export interface DirectorySelectProps {
  onDirectoryChange(directory: FileSystemDirectoryHandle): void;
}

export function DirectorySelect({ onDirectoryChange }: DirectorySelectProps) {
  const [error, setError] = useState("");
  const [lastUsedDirectory, setLastUsedDirectory] =
    useState<FileSystemDirectoryHandle>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const lastUsedDirectory = await get("@kragle/ide/last-used-directory");
      if (
        !cancelled &&
        lastUsedDirectory instanceof FileSystemDirectoryHandle
      ) {
        setLastUsedDirectory(lastUsedDirectory);
      }
    })();
  }, []);

  async function openDirectoryPicker() {
    try {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      set("@kragle/ide/last-used-directory", directory);
      onDirectoryChange(directory);
    } catch (e) {
      setError(`${e}`);
    }
  }

  async function openLastUsedDirectory() {
    if (!lastUsedDirectory) return;
    if (
      (await lastUsedDirectory.queryPermission({ mode: "readwrite" })) ===
      "granted"
    ) {
      onDirectoryChange(lastUsedDirectory);
    } else if (
      (await lastUsedDirectory.requestPermission({ mode: "readwrite" })) ===
      "granted"
    ) {
      onDirectoryChange(lastUsedDirectory);
    } else {
      setError("Permissions not granted.");
    }
  }

  return (
    <div className="folder-select">
      <div className="folder-select__body">
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button onClick={openDirectoryPicker}>
          Select kragle project directory
        </button>
        {lastUsedDirectory && (
          <button onClick={openLastUsedDirectory}>
            Open last used directory: {lastUsedDirectory.name}
          </button>
        )}
      </div>
    </div>
  );
}
