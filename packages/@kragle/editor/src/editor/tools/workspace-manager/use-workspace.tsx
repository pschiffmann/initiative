import { get, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";
import { Workspace } from "./workspace.js";

const idbKey = "@kragle/editor::last-used-workspace";

export function useWorkspace(): [
  Workspace | null,
  (workspace: Workspace | null) => void,
] {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const [, forceUpdate] = useState({});
  useEffect(() => {
    return workspace?.listen("change", () => forceUpdate({}));
  }, [workspace]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const lastUsedWorkspace = await get(idbKey);
      if (
        !cancelled &&
        lastUsedWorkspace instanceof FileSystemDirectoryHandle
      ) {
        setWorkspace(new Workspace(lastUsedWorkspace));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setWorkspaceAndPersist = useCallback((workspace: Workspace | null) => {
    setWorkspace(workspace);
    if (workspace) set(idbKey, workspace?.rootDirectory);
  }, []);

  return [workspace, setWorkspaceAndPersist];
}
