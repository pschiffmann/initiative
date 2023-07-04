import { bemClasses } from "@kragle/design-system";
import { SceneDocument, useNode } from "@kragle/runtime";
import { Fragment } from "react";
import { ToolFrame } from "../tool-frame.js";
import { NodeInputControl } from "./controls.js";
import { AncestorOutputsProvider } from "./use-input-options.js";

const cls = bemClasses("kragle-node-inputs");

export interface NodeInputsProps {
  document: SceneDocument;
  selectedNode: string | null;
  className?: string;
}

export function NodeInputs({
  document,
  selectedNode,
  className,
}: NodeInputsProps) {
  return (
    <ToolFrame className={cls.block(className)} title="Node Properties">
      {selectedNode ? (
        <NodeInputsList document={document} selectedNode={selectedNode} />
      ) : (
        <div className={cls.element("empty-state")}>No node selected.</div>
      )}
    </ToolFrame>
  );
}

interface NodeInputsListProps {
  document: SceneDocument;
  selectedNode: string;
}

function NodeInputsList({ document, selectedNode }: NodeInputsListProps) {
  const nodeData = useNode(document, selectedNode);

  return (
    <AncestorOutputsProvider document={document} nodeData={nodeData}>
      <div className={cls.element("list")}>
        <div className={cls.element("card")}>
          <div className={cls.element("card-label")}>ID</div>
          <div className={cls.element("card-value")}>{nodeData.id}</div>
          <div className={cls.element("card-label")}>Type</div>
          <div className={cls.element("card-value")}>{nodeData.type}</div>
        </div>

        {nodeData.forEachInput(
          (expression, type, inputName, index) =>
            index === undefined && (
              <NodeInputControl
                key={inputName}
                document={document}
                nodeData={nodeData}
                inputName={inputName}
              />
            )
        )}

        {nodeData.schema.forEachSlot(
          (slotName, { isCollectionSlot, inputNames }) =>
            isCollectionSlot && (
              <Fragment key={slotName}>
                {nodeData.forEachChildInSlot(slotName, (childId, index) => (
                  <Fragment key={childId}>
                    <div className={cls.element("slot-section")}>
                      {index !== -1 ? `${slotName} ${index + 1}` : slotName}{" "}
                      <span className={cls.element("child-id")}>
                        [{childId}]
                      </span>
                    </div>

                    {inputNames.map((inputName) => (
                      <NodeInputControl
                        key={inputName}
                        document={document}
                        nodeData={nodeData}
                        inputName={inputName}
                        index={index}
                      />
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            )
        )}
      </div>
    </AncestorOutputsProvider>
  );
}
