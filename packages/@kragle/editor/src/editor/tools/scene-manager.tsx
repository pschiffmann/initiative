import { IconButton, bemClasses } from "@kragle/design-system";

const cls = bemClasses("kragle-scene-manager");

export interface SceneManagerProps {
  className?: string;
}

export function SceneManager({ className }: SceneManagerProps) {
  return (
    <div className={cls.block(className)}>
      <div className={cls.element("header")}>
        <div className={cls.element("title")}>Scenes</div>
        <IconButton
          className={cls.element("button")}
          icon="note_add"
          label="New Scene"
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
    </div>
  );
}
