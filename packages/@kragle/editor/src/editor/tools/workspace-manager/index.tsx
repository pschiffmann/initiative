import {
  Button,
  Dialog,
  DialogCommand,
  IconButton,
  Typography,
  bemClasses,
} from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import { SceneDocument, sceneDocumentFromJson } from "@kragle/runtime";
import { useContext, useState } from "react";
import { DefinitionsContext } from "../../context.js";
import { ToolFrame } from "../tool-frame.js";
import { CreateSceneForm } from "./create-scene-form.js";
import { OpenWorkspaceDialog } from "./open-workspace-dialog.js";
import { useWorkspace } from "./use-workspace.js";

export { Workspace } from "./workspace.js";

const cls = bemClasses("kragle-workspace-manager");

export interface SceneManagerProps {
  document: SceneDocument | null;
  onDocumentChange(document: SceneDocument | null): void;
  className?: string;
}

export function WorkspaceManager({
  document,
  onDocumentChange,
  className,
}: SceneManagerProps) {
  const [workspace, setWorkspace] = useWorkspace();

  const [openWorkspaceDialogController] = useState(
    () => new CommandController<DialogCommand>(),
  );
  const [createSceneDialogController] = useState(
    () => new CommandController<DialogCommand>(),
  );

  const definitions = useContext(DefinitionsContext);
  async function openScene(name: string) {
    try {
      const sceneJson = JSON.parse(await workspace!.readSceneJson(name));
      const { errors, document } = sceneDocumentFromJson(
        definitions,
        name,
        sceneJson,
      );
      if (errors) {
        alert(
          "The scene.json file contains errors. Check the dev tools console.",
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
    <ToolFrame
      className={cls.block(className)}
      title="Scenes"
      actions={
        document ? (
          <>
            <IconButton
              className={cls.element("button")}
              icon="save"
              label="Save"
              onPress={() => {
                workspace!.save(document);
              }}
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
              onPress={() => createSceneDialogController.send("open")}
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
        )
      }
    >
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
                null,
                document?.name === scene && "selected",
                document && document.name !== scene && "disabled",
              )}
              onClick={document ? undefined : () => openScene(scene)}
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
      {workspace && (
        <Dialog commandStream={createSceneDialogController}>
          <CreateSceneForm
            dialogController={createSceneDialogController}
            workspace={workspace}
          />
        </Dialog>
      )}
    </ToolFrame>
  );
}
