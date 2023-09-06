import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { CommandController } from "@initiativejs/react-command";
import { SceneDocument } from "../../../shared/index.js";
import { DataFlowAbsoluteContainer } from "./data-flow-absolute-container.js";

const cls = bemClasses("initiative-data-flow-inspector");

export interface DataFlowInspectorProps {
  controller: CommandController<DialogCommand>;
  document: SceneDocument;
  selectedNode: string | null;
}

export function DataFlowInspector({
  controller,
  document,
  selectedNode,
}: DataFlowInspectorProps) {
  return (
    <Dialog className={cls.block()} commandStream={controller}>
      <DataFlowAbsoluteContainer
        document={document}
        selectedNode={selectedNode}
      />
    </Dialog>
  );
}
