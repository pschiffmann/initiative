import { Dialog, DialogCommand, bemClasses } from "#design-system";
import { SceneDocument } from "#shared";
import { CommandController } from "@initiativejs/react-command";
import { Canvas } from "./canvas.js";

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
      <Canvas document={document} selectedNode={selectedNode} />
    </Dialog>
  );
}
