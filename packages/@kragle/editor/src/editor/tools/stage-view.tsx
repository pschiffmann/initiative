import { bemClasses } from "@kragle/design-system";

const cls = bemClasses("kragle-stage-view");

export interface StageViewProps {
  className?: string;
}

export function StageView({ className }: StageViewProps) {
  return <div className={cls.block(className)}>Stage view</div>;
}
