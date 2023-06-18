import { Dialog, IconButton, bemClasses } from "@kragle/design-system";
import { CommandController } from "@kragle/react-command";
import { useState } from "react";

const cls = bemClasses("kragle-scene-manager");

export interface SceneManagerProps {
  className?: string;
}

export function SceneManager({ className }: SceneManagerProps) {
  const [openCreateDialogController] = useState(
    () => new CommandController<boolean>()
  );

  return (
    <div className={cls.block(className)}>
      <div className={cls.element("header")}>
        <div className={cls.element("title")}>Scenes</div>
        <IconButton
          className={cls.element("button")}
          icon="note_add"
          label="New Scene"
          onPress={() => openCreateDialogController.send(true)}
        />
        <IconButton
          className={cls.element("button")}
          icon="sync"
          label="Sync local files"
        />
        <IconButton
          className={cls.element("button")}
          icon="folder"
          label="Select Kragle directory"
        />
      </div>

      <ul className={cls.element("list")}></ul>

      <Dialog setOpenCommandStream={openCreateDialogController}>
        Hello world
      </Dialog>
    </div>
  );
}
