import { SceneDocument } from "@kragle/runtime";
import { ReactElement } from "react";
import { bemClasses } from "../../bem-classes.js";
import { NodeBox } from "./node-box.js";
import {
  Layout,
  NodeBoxPosition,
  nodeBoxSizes,
  useLayout,
} from "./use-layout.js";

const cls = bemClasses("node-bindings-canvas");

export interface NodeBindingsCanvasProps {
  document: SceneDocument;
  zoom: number;
}

export function NodeBindingsCanvas({
  document,
  zoom,
}: NodeBindingsCanvasProps) {
  const layout = useLayout(document);

  return (
    <div className={cls.block()}>
      <div
        className={cls.element("container")}
        style={{
          width: layout.canvasWidth * zoom,
          height: layout.canvasHeight * zoom,
          transform: `scale(${zoom})`,
        }}
      >
        <ConnectionLines document={document} layout={layout} />
        {Object.entries(layout.nodeBoxPositions).map(([nodeId, position]) => {
          const nodeJson = document.getNode(nodeId)!;
          const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
          return (
            <NodeBox
              key={nodeId}
              position={position}
              document={document}
              nodeId={nodeId}
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
        ([parentId, parentPosition]) => {
          const lines: ReactElement[] = [];

          function addLine(childId: string, childPosition: NodeBoxPosition) {
            const x1 = parentPosition.offsetLeft + nodeBoxSizes.boxWidth;
            const y1 =
              parentPosition.offsetTop +
              nodeBoxSizes.header / 2 +
              nodeBoxSizes.padding;
            const x2 = childPosition.offsetLeft;
            const y2 =
              childPosition.offsetTop +
              nodeBoxSizes.header / 2 +
              nodeBoxSizes.padding;
            const center = (x1 + x2) / 2;
            lines.push(
              <path
                key={childId}
                className={cls.element("child-line")}
                // d={`M ${x1} ${y1} C ${center} ${y1} ${center} ${y2} ${x2} ${y2}`}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
              />
            );
          }

          const nodeJson = document.getNode(parentId)!;
          const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
          for (const childId of Object.values(nodeJson.slots)) {
            if (!childId) continue;
            addLine(childId, layout.nodeBoxPositions[childId]);
          }
          for (const slotName of schema.getCollectionSlots()) {
            for (const childId of nodeJson.collectionSlots[slotName]) {
              addLine(childId, layout.nodeBoxPositions[childId]);
            }
          }

          return lines;
        }
      )}

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

              const x1 =
                sourcePosition.offsetLeft +
                nodeBoxSizes.boxWidth +
                nodeBoxSizes.connectorOffsetX;
              const y1 =
                sourcePosition.offsetTop +
                sourceOutputOffset +
                nodeBoxSizes.connectorOffsetY;
              const x2 =
                targetPosition.offsetLeft - nodeBoxSizes.connectorOffsetX;
              const y2 =
                targetPosition.offsetTop +
                targetInputOffset +
                nodeBoxSizes.connectorOffsetY;
              const center = (x1 + x2) / 2;
              lines.push(
                <path
                  key={`${targetId}/${inputName}`}
                  className={cls.element("connection-line")}
                  //d={`M ${x1} ${y1} C ${center} ${y1} ${center} ${y2} ${x2} ${y2}`}
                  d={`M ${x1} ${y1} C ${center} ${y1} ${center} ${y2} ${x2} ${y2}`}
                  //d={`M ${x1} ${y1} L ${x2} ${y2}`}
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
