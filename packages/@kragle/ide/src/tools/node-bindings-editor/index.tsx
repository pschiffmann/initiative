import { SceneDocument } from "@kragle/runtime";
import { ReactElement } from "react";
import { bemClasses } from "../../bem-classes.js";
import { NodeBox } from "./node-box.js";
import { Layout, nodeBoxSizes, useLayout } from "./use-layout.js";

const cls = bemClasses("bindings-editor");

interface NodeBindingsEditorProps {
  document: SceneDocument;
}

export function NodeBindingsEditor({ document }: NodeBindingsEditorProps) {
  const layout = useLayout(document);
  return (
    <div className={cls.block()}>
      <div
        className={cls.element("container")}
        style={{ width: layout.canvasWidth, height: layout.canvasHeight }}
      >
        <ConnectionLines document={document} layout={layout} />
        {Object.entries(layout.nodeBoxPositions).map(([nodeId, position]) => {
          const nodeJson = document.getNode(nodeId)!;
          const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
          return (
            <NodeBox
              key={nodeId}
              position={position}
              nodeId={nodeId}
              nodeJson={nodeJson}
              schema={schema}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ConnectionLinesProps {
  document: SceneDocument;
  layout: Layout;
}

function ConnectionLines({ document, layout }: ConnectionLinesProps) {
  return (
    <svg
      className={cls.element("connection-lines")}
      width={layout.canvasWidth}
      height={layout.canvasHeight}
    >
      {Object.entries(layout.nodeBoxPositions).flatMap(
        ([targetId, targetPosition]) => {
          const lines: ReactElement[] = [];

          const targetJson = document.getNode(targetId)!;
          for (const [inputName, targetInputOffset] of Object.entries(
            targetPosition.inputOffsets
          )) {
            if (inputName.includes("/")) {
              // TODO: collection input
              continue;
            } else {
              const binding = targetJson.inputs[inputName];
              if (binding?.type !== "node-output") continue;
              const sourcePosition = layout.nodeBoxPositions[binding.nodeId];
              const sourceOutputOffset =
                sourcePosition.outputOffsets[binding.outputName];

              lines.push(
                <line
                  key={`${targetId}/${inputName}`}
                  className={cls.element("connection-line")}
                  x1={
                    sourcePosition.offsetLeft +
                    nodeBoxSizes.boxWidth +
                    nodeBoxSizes.connectorOffsetX
                  }
                  y1={
                    sourcePosition.offsetTop +
                    sourceOutputOffset +
                    nodeBoxSizes.connectorOffsetY
                  }
                  x2={targetPosition.offsetLeft - nodeBoxSizes.connectorOffsetX}
                  y2={
                    targetPosition.offsetTop +
                    targetInputOffset +
                    nodeBoxSizes.connectorOffsetY
                  }
                />
              );
            }
          }

          return lines;
        }
      )}
    </svg>
  );
}
