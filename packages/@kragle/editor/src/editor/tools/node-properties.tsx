import { bemClasses } from "@kragle/design-system";

const cls = bemClasses("kragle-node-properties");

export interface NodePropertiesProps {
  className?: string;
}

export function NodeProperties({ className }: NodePropertiesProps) {
  return <div className={cls.block(className)}>Node properties</div>;
}
