import {
  AlertDialogContent,
  Button,
  Dialog,
  Typography,
  bemClasses,
} from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import { Workspace } from "./workspace.js";

const cls = bemClasses("kragle-open-workspace-dialog");

export interface OpenWorkspaceDialogProps {
  controller: CommandController<boolean>;
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
      controller.send(false);
    } catch (e) {
      console.error(`Error while opening workspace directory: `, e);
    }
  }

  return (
    <Dialog className={cls.block()} setOpenCommandStream={controller}>
      <AlertDialogContent
        title="Open workspace"
        actions={
          <>
            <Button
              className={cls.element("cancel")}
              label="Cancel"
              onPress={() => controller.send(false)}
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
          kragle.json
        </Typography>{" "}
        file.
      </AlertDialogContent>
    </Dialog>
  );
}
