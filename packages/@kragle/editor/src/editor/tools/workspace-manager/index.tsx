import {
  Button,
  DialogCommand,
  IconButton,
  Typography,
  bemClasses,
} from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import {
  Definitions,
  SceneDocument,
  sceneDocumentFromJson,
} from "@kragle/runtime/v2";
import { useState } from "react";
import { OpenWorkspaceDialog } from "./open-workspace-dialog.js";
import { useWorkspace } from "./use-workspace.js";

export { Workspace } from "./workspace.js";

const cls = bemClasses("kragle-workspace-manager");

export interface SceneManagerProps {
  definitions: Definitions;
  document: SceneDocument | null;
  onDocumentChange(document: SceneDocument | null): void;
  className?: string;
}

export function WorkspaceManager({
  definitions,
  document,
  onDocumentChange,
  className,
}: SceneManagerProps) {
  const [workspace, setWorkspace] = useWorkspace();

  const [openWorkspaceDialogController] = useState(
    () => new CommandController<DialogCommand>()
  );

  async function openScene(name: string) {
    try {
      const sceneJson = JSON.parse(await workspace!.readSceneJson(name));
      const { errors, document } = sceneDocumentFromJson(
        definitions,
        name,
        sceneJson
      );
      if (errors) {
        alert(
          "The scene.json file contains errors. Check the dev tools console."
        );
        console.error({ errors });
      } else {
        onDocumentChange(document!);
      }
    } catch (e) {
      console.error(e);
      alert("An error occured. Check the dev tools console.");
    }
  }

  return (
    <div className={cls.block(className)}>
      <div className={cls.element("header")}>
        <div className={cls.element("title")}>Scenes</div>
        {document ? (
          <>
            <IconButton
              className={cls.element("button")}
              icon="save"
              label="Save"
            />
            <IconButton
              className={cls.element("button")}
              icon="close"
              label="Close"
              onPress={() => onDocumentChange(null)}
            />
          </>
        ) : (
          <>
            <IconButton
              className={cls.element("button")}
              icon="note_add"
              label="New Scene"
              disabled={workspace?.state !== "ready"}
            />
            <IconButton
              className={cls.element("button")}
              icon="sync"
              label="Sync local files"
              disabled={workspace?.state !== "ready"}
              onPress={() => workspace!.scanFileSystem()}
            />
            <IconButton
              className={cls.element("button")}
              icon="folder"
              label="Select Kragle directory"
              onPress={() => openWorkspaceDialogController.send("open")}
            />
          </>
        )}
      </div>

      {!workspace ? (
        <div className={cls.element("empty-state")}>No workspace selected.</div>
      ) : workspace.state === "initializing" ? (
        <div className={cls.element("empty-state")}>Initializing ...</div>
      ) : workspace.state === "error" ? (
        <div className={cls.element("error-state")}>
          Error: {workspace.error}
        </div>
      ) : workspace.state === "permission-prompt" ? (
        <div className={cls.element("permission-prompt-container")}>
          <Typography variant="body-medium">
            Kragle requires permissions to open the workspace.
          </Typography>
          <Button
            className={cls.element("permission-prompt-button")}
            label="Grant permissions"
            onPress={() => workspace.requestPermissions()}
          />
        </div>
      ) : workspace.scenes.length === 0 ? (
        <div className={cls.element("empty-state")}>No scenes found.</div>
      ) : (
        <ul className={cls.element("scenes")}>
          {workspace.scenes.map((scene) => (
            <li
              key={scene}
              className={cls.element(
                "scene",
                document && document.name !== scene && "disabled"
              )}
              onClick={() => openScene(scene)}
            >
              {scene}
            </li>
          ))}
        </ul>
      )}

      <OpenWorkspaceDialog
        controller={openWorkspaceDialogController}
        onWorkspaceChange={setWorkspace}
      />
    </div>
  );
}