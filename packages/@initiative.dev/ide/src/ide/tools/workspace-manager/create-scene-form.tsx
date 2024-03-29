import {
  AlertDialogContent,
  Button,
  DialogCommand,
  TextFieldControl,
  bemClasses,
} from "#design-system";
import { SceneDocument } from "#shared";
import { CommandController } from "@initiative.dev/react-command";
import { validateSceneName } from "@initiative.dev/schema";
import { useContext, useState } from "react";
import { DefinitionsContext } from "../../context.js";
import { Workspace } from "./workspace.js";

const cls = bemClasses("initiative-create-scene-form");

export interface CreateSceneFormProps {
  dialogController: CommandController<DialogCommand>;
  workspace: Workspace;
}

export function CreateSceneForm({
  dialogController,
  workspace,
}: CreateSceneFormProps) {
  const [sceneName, setSceneName] = useState("");

  let sceneNameError: string | undefined;
  if (workspace.scenes.includes(sceneName)) {
    sceneNameError = "A scene with this name already exists.";
  }
  try {
    validateSceneName(sceneName);
  } catch (e) {
    sceneNameError = e instanceof Error ? e.message : `${e}`;
  }

  const definitions = useContext(DefinitionsContext);
  async function createScene() {
    dialogController.send("close");
    const document = new SceneDocument(
      sceneName,
      definitions,
      workspace.projectConfig!,
    );
    await workspace.save(document);
    await workspace.scanFileSystem();
  }

  return (
    <AlertDialogContent
      className={cls.block()}
      title="New scene"
      actions={
        <>
          <Button
            label="Cancel"
            onPress={() => dialogController.send("close")}
          />
          <Button
            className={cls.element("create-button")}
            label="Create"
            onPress={createScene}
            disabled={!!sceneNameError}
          />
        </>
      }
    >
      <TextFieldControl
        label="Scene name"
        errorText={sceneNameError}
        value={sceneName}
        onChange={setSceneName}
        onClear={() => setSceneName("")}
      />
    </AlertDialogContent>
  );
}
