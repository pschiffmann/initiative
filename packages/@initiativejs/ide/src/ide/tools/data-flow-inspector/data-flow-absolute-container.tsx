import { bemClasses } from "#design-system";
import { SceneDocument } from "../../../shared/index.js";
import { Layout, expressionEvaluation, useLayout } from "./layout-algorithm.js";
import { DfiLines } from "./lines.js";
import { NodeBox } from "./node-box.js";

const cls = bemClasses("initiative-data-flow-inspector-canvas");

export interface DFACProps {
  document: SceneDocument;
  selectedNode: string | null;
}

export function DataFlowAbsoluteContainer({
  document,
  selectedNode,
}: DFACProps) {
  const canvas: Layout = useLayout(document);
  return (
    <div className={cls.block()}>
      <>
        <svg width={canvas.canvasWidth} height={canvas.canvasHeight}>
          {document
            .keys()
            .map((toid) =>
              document.getNode(toid).parent === null ? null : (
                <DfiLines
                  className={cls.element("line", null, "parent")}
                  startX={
                    canvas.nodeBoxPositions[
                      document.getNode(toid).parent!.nodeId
                    ].offsetLeft + 320
                  }
                  startY={
                    canvas.nodeBoxPositions[
                      document.getNode(toid).parent!.nodeId
                    ].offsetTop + 32
                  }
                  tunnel={undefined}
                  endX={canvas.nodeBoxPositions[toid].offsetLeft}
                  endY={canvas.nodeBoxPositions[toid].offsetTop + 32}
                />
              ),
            )}
          {document.keys().map((toid) =>
            document
              .getNode(toid)
              .forEachInput((expression, type, inputName, index) =>
                expression !== null
                  ? expressionEvaluation(expression).map((value) => (
                      <>
                        <DfiLines
                          className={cls.element("line", null, "io")}
                          startX={
                            canvas.nodeBoxPositions[value[0]].offsetLeft + 320
                          }
                          startY={
                            canvas.nodeBoxPositions[value[0]].offsetTop +
                            canvas.nodeBoxPositions[value[0]].outputOffsets[
                              value[1]
                            ]
                          }
                          tunnel={
                            canvas.nodeBoxPositions[toid].tunnels[value[0]]
                          }
                          endX={canvas.nodeBoxPositions[toid].offsetLeft}
                          endY={
                            canvas.nodeBoxPositions[toid].offsetTop +
                            canvas.nodeBoxPositions[toid].inputOffsets[
                              inputName
                            ]
                          }
                        />
                      </>
                    ))
                  : null,
              ),
          )}
        </svg>
        {Object.keys(canvas.nodeBoxPositions).map((key) => (
          <>
            <NodeBox
              data={document.getNode(key)}
              focus={selectedNode}
              positioning={canvas.nodeBoxPositions[key]}
            />
          </>
        ))}
      </>
    </div>
  );
}
