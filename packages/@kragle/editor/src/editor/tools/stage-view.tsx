import { bemClasses } from "@kragle/design-system";
import { SceneDocument } from "@kragle/runtime/v2";

const cls = bemClasses("kragle-stage-view");

export interface StageViewProps {
  document: SceneDocument | null;
  className?: string;
}

export function StageView({ document, className }: StageViewProps) {
  return (
    <div className={cls.block(className)}>
      {document ? (
        <iframe className={cls.element("iframe")} src="./stage.html" />
      ) : (
        <div className={cls.element("empty-state")}>No scene selected.</div>
      )}
    </div>
  );
}
