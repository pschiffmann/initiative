import { bemClasses } from "#design-system";
import { SceneDocument } from "#shared";
import { Layout, expressionEvaluation, useLayout } from "./layout-algorithm.js";
import { Line } from "./line.js";
import { NodeBox } from "./node-box.js";

const cls = bemClasses("initiative-data-flow-inspector-canvas");

export interface CanvasProps {
  document: SceneDocument;
  selectedNode: string | null;
  zoom: number;
  className?: string;
}

export function Canvas({
  document,
  selectedNode,
  zoom,
  className,
}: CanvasProps) {
  const canvas: Layout = useLayout(document);
  return (
    <div className={cls.block(className)}>
      <div className={cls.element("container")} style={{ zoom }}>
        <svg width={canvas.canvasWidth} height={canvas.canvasHeight}>
          {document.keys().map((childNodeId) => {
            const { parent } = document.getNode(childNodeId);
            if (!parent) return null;
            const parentPosition = canvas.nodeBoxPositions[parent.nodeId];
            const childPosition = canvas.nodeBoxPositions[childNodeId];
            return (
              <Line
                key={childNodeId}
                className={cls.element("line", null, "parent")}
                startX={parentPosition.offsetLeft + 320}
                startY={parentPosition.offsetTop + 32}
                tunnel={undefined}
                endX={childPosition.offsetLeft}
                endY={childPosition.offsetTop + 32}
              />
            );
          })}

          {document.keys().map((descendantNodeId) =>
            document.getNode(descendantNodeId).forEachInput(
              (expression, type, inputName, index) =>
                expression &&
                expressionEvaluation(expression).map(
                  ([ancestorNodeId, outputName]) => {
                    const ancestorPosition =
                      canvas.nodeBoxPositions[ancestorNodeId];
                    const descendantPosition =
                      canvas.nodeBoxPositions[descendantNodeId];
                    const inputKey =
                      index === undefined
                        ? inputName
                        : `${inputName}::${index}`;
                    return (
                      <Line
                        key={`${descendantNodeId}.${inputKey}`}
                        className={cls.element("line", null, "io")}
                        startX={ancestorPosition.offsetLeft + 320}
                        startY={
                          ancestorPosition.offsetTop +
                          ancestorPosition.outputOffsets[outputName]
                        }
                        tunnel={descendantPosition.tunnels[ancestorNodeId]}
                        endX={descendantPosition.offsetLeft}
                        endY={
                          descendantPosition.offsetTop +
                          descendantPosition.inputOffsets[inputKey]
                        }
                      />
                    );
                  },
                ),
            ),
          )}
        </svg>

        {Object.keys(canvas.nodeBoxPositions).map((key) => (
          <NodeBox
            key={key}
            data={document.getNode(key)}
            focus={selectedNode}
            positioning={canvas.nodeBoxPositions[key]}
          />
        ))}
      </div>
    </div>
  );
}
