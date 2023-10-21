import {
  AlertDialogContent,
  Button,
  Dialog,
  DialogCommand,
  Typography,
  bemClasses,
} from "#design-system";
import { CommandController } from "@initiative.dev/react-command";
import { Workspace } from "./workspace.js";

const cls = bemClasses("initiative-open-workspace-dialog");

export interface OpenWorkspaceDialogProps {
  controller: CommandController<DialogCommand>;
  onWorkspaceChange(workspace: Workspace): void;
}

export function OpenWorkspaceDialog({
  controller,
  onWorkspaceChange,
}: OpenWorkspaceDialogProps) {
  async function openDirectoryPicker() {
    try {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      onWorkspaceChange(new Workspace(directory));
      controller.send("close");
    } catch (e) {
      console.error(`Error while opening workspace directory: `, e);
    }
  }

  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <AlertDialogContent
        title="Open workspace"
        actions={
          <>
            <Button
              className={cls.element("cancel")}
              label="Cancel"
              onPress={() => controller.send("close")}
            />
            <Button
              className={cls.element("open-directory-button")}
              label="Open directory"
              onPress={openDirectoryPicker}
            />
          </>
        }
      >
        Select the directory from your repository that contains the{" "}
        <Typography component="code" variant="code-medium">
          initiative.json
        </Typography>{" "}
        file.
      </AlertDialogContent>
    </Dialog>
  );
}
