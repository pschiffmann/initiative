import { bemClasses } from "@kragle/design-system";

const cls = bemClasses("kragle-node-tree");

export interface NodeTreeProps {
  className?: string;
}

export function NodeTree({ className }: NodeTreeProps) {
  return <div className={cls.block(className)}>Node tree</div>;
}
