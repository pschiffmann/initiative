import { bemClasses } from "#design-system";
import {
  ComponentNodeData,
  SceneDocument,
  useSceneDocumentVersion,
} from "#shared";
import { useMemo } from "react";
import { Layout, expressionEvaluation, useLayout } from "./layout-algorithm.js";
import { Line } from "./line.js";
import { NodeBox } from "./node-box.js";

const cls = bemClasses("initiative-data-flow-inspector-canvas");

export interface CanvasProps {
  document: SceneDocument;
  selectedNode: string | null;
  zoom: number;
  className?: string;
  onSelectedNodeChange(nodeId: string | null): void;
}

export function Canvas({
  document,
  selectedNode,
  zoom,
  className,
  onSelectedNodeChange,
}: CanvasProps) {
  const version = useSceneDocumentVersion(document);
  const canvas: Layout = useLayout(document, selectedNode ? selectedNode : "");
  const picture = useMemo(() => {
    return (
      <>
        <svg width={canvas.canvasWidth} height={canvas.canvasHeight}>
          {document.keys().map((childNodeId) => {
            const { parent } = document.getNode(childNodeId);
            if (!parent) return null;
            const parentPosition = canvas.nodeBoxPositions[parent.nodeId];
            const childPosition = canvas.nodeBoxPositions[childNodeId];
            if (!parentPosition || !childPosition) return null;
            return (
              <Line
                key={childNodeId}
                className={cls.element("line", null, "parent")}
                startX={parentPosition.offsetLeft + 320}
                startY={parentPosition.offsetTop + 32}
                tunnel={undefined}
                endX={childPosition.offsetLeft}
                endY={childPosition.offsetTop + 32}
                onSelectedNodeChange={() => {
                  onSelectedNodeChange(childNodeId);
                }}
              />
            );
          })}

          {document.keys().map((descendantNodeId) => {
            const node = document.getNode(descendantNodeId);
            if (!(node instanceof ComponentNodeData)) return null;
            return node.forEachInput(
              (expression, type, inputName, index) =>
                expression &&
                expressionEvaluation(expression).map(
                  ([ancestorNodeId, outputName]) => {
                    const ancestorPosition =
                      canvas.nodeBoxPositions[ancestorNodeId];
                    const descendantPosition =
                      canvas.nodeBoxPositions[descendantNodeId];
                    if (!ancestorPosition || !descendantPosition) return null;
                    const inputKey =
                      index === undefined
                        ? inputName
                        : `${inputName}::${index}`;
                    return (
                      <Line
                        key={`${ancestorNodeId}.${outputName}.${descendantNodeId}.${inputKey}`}
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
                        onSelectedNodeChange={() => {
                          onSelectedNodeChange(descendantNodeId);
                        }}
                      />
                    );
                  },
                ),
            );
          })}
        </svg>

        {Object.keys(canvas.nodeBoxPositions).map((key) => (
          <NodeBox
            key={key}
            data={document.getNode(key)}
            focus={selectedNode}
            positioning={canvas.nodeBoxPositions[key]}
            onSelectedNodeChange={onSelectedNodeChange}
          />
        ))}
      </>
    );
  }, [document, version, selectedNode]);

  return (
    <div className={cls.block(className)}>
      <div className={cls.element("container")} style={{ zoom }}>
        {picture}
      </div>
    </div>
  );
}
