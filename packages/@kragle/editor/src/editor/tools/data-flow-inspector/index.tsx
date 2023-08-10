import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { CommandController } from "@kragle/react-command";

const cls = bemClasses("kragle-data-flow-inspector");

export interface DataFlowInspectorProps {
  controller: CommandController<DialogCommand>;
}

export function DataFlowInspector({ controller }: DataFlowInspectorProps) {
  return (
    <Dialog className={cls.block()} commandStream={controller}>
      TODO
    </Dialog>
  );
}
