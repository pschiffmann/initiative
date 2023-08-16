import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { CommandController } from "@initiativejs/react-command";

const cls = bemClasses("initiative-data-flow-inspector");

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
