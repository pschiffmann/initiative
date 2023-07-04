import { bemClasses } from "@kragle/design-system";
import { SceneDocument } from "@kragle/runtime/v2";

const cls = bemClasses("kragle-stage-view");

export interface StageViewProps {
  document: SceneDocument;
  className?: string;
}

export function StageView({ document, className }: StageViewProps) {
  return (
    <div className={cls.block(className)}>
      <iframe className={cls.element("iframe")} src="./stage.html" />
    </div>
  );
}
