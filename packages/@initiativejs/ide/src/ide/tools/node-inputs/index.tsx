import { bemClasses } from "#design-system";
import { ExpressionJson, SceneDocument, useNode } from "#shared";
import { Fragment } from "react";
import { ToolFrame } from "../tool-frame.js";
import { ExpressionControl } from "./expression-control.js";
import { SceneDocumentContext } from "./use-scene-document.js";
import { SelectedNodeAncestorsProvider } from "./use-selected-node-ancestors.js";

const cls = bemClasses("initiative-node-inputs");

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

  function setNodeInput(
    expression: ExpressionJson | null,
    inputName: string,
    index?: number,
  ) {
    document.applyPatch({
      type: "set-node-input",
      nodeId: nodeData.id,
      expression,
      inputName,
      index,
    });
  }

  return (
    <SceneDocumentContext.Provider value={document}>
      <SelectedNodeAncestorsProvider
        document={document}
        selectedNode={selectedNode}
      >
        <div className={cls.element("list")}>
          <div className={cls.element("card")}>
            <div className={cls.element("card-label")}>ID</div>
            <div className={cls.element("card-value")}>{nodeData.id}</div>
            <div className={cls.element("card-label")}>Type</div>
            <div className={cls.element("card-value")}>{nodeData.type}</div>
          </div>

          {nodeData.forEachInput(
            (expression, { type, optional }, inputName, index) =>
              index !== undefined ? null : (
                <ExpressionControl
                  key={inputName}
                  parent="node"
                  name={inputName}
                  expectedType={type}
                  optional={optional}
                  expression={expression}
                  onChange={(value) => setNodeInput(value, inputName)}
                />
              ),
          )}

          {nodeData.schema.forEachSlot(
            (slotName, { isCollectionSlot, inputNames }) =>
              isCollectionSlot &&
              nodeData.forEachChildInSlot(slotName, (childId, index) => (
                <Fragment key={`${slotName}_${childId}`}>
                  <div className={cls.element("slot-section")}>
                    {index !== -1 ? `${slotName} ${index + 1}` : slotName}{" "}
                    <span className={cls.element("child-id")}>[{childId}]</span>
                  </div>

                  {inputNames.map((inputName) => {
                    const { type, optional } =
                      nodeData.schema.inputAttributes[inputName];
                    const expression =
                      nodeData.inputs[`${inputName}::${index}`];
                    return (
                      <ExpressionControl
                        key={inputName}
                        parent="node"
                        name={inputName}
                        expectedType={type}
                        optional={optional}
                        expression={expression}
                        onChange={(value) =>
                          setNodeInput(value, inputName, index)
                        }
                      />
                    );
                  })}
                </Fragment>
              )),
          )}
        </div>
      </SelectedNodeAncestorsProvider>
    </SceneDocumentContext.Provider>
  );
}
