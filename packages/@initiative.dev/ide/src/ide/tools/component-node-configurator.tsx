import { bemClasses } from "#design-system";
import { ExpressionJson, SceneDocument, useNode } from "#shared";
import { Fragment } from "react";
import {
  ExpressionControl,
  SelectedNodeAncestorsProvider,
} from "../expression-controls/index.js";
import { ToolFrame } from "./tool-frame.js";

const cls = bemClasses("initiative-component-node-configurator");

export interface ComponentNodeConfiguratorProps {
  document: SceneDocument;
  selectedNode: string | null;
  className?: string;
}

export function ComponentNodeConfigurator({
  document,
  selectedNode,
  className,
}: ComponentNodeConfiguratorProps) {
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
      type: "set-component-node-input",
      nodeId: nodeData.id,
      expression,
      inputName,
      index,
    });
  }

  return (
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
                  const expression = nodeData.inputs[`${inputName}::${index}`];
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
  );
}
