import { AnyNodeSchema, NodeJson, SceneDocument } from "@kragle/runtime";

export function useLayout(document: SceneDocument) {
  return calculateLayout(document);
}

export interface Layout {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly nodeBoxPositions: Readonly<Record<string, NodeBoxPosition>>;
}

export interface NodeBoxPosition {
  /**
   * Distance between the canvas left edge and the NodeBox left edge in px.
   */
  readonly offsetLeft: number;

  /**
   * Distance between the canvas top edge and the NodeBox top edge in px.
   */
  readonly offsetTop: number;

  /**
   * NodeBox height in px.
   */
  readonly height: number;

  /**
   * Map from input name to input row distance from the NodeBox top edge in px.
   *
   * Array inputs are stored as `<input name>/<index>` keys.
   */
  readonly inputOffsets: Readonly<Record<string, number>>;

  /**
   * Map from input name to input row distance from the NodeBox top edge in px.
   */
  readonly outputOffsets: Readonly<Record<string, number>>;
}

function calculateLayout(document: SceneDocument): Layout {
  let canvasWidth = 0;
  let canvasHeight = 0;
  const nodeBoxPositions: Record<string, NodeBoxPosition> = {};
  const columnHeights = new Map<number, number>();

  const queue = new Set([{ nodeId: document.getRootNodeId()!, column: 0 }]);
  for (const { nodeId, column } of queue) {
    const nodeJson = document.getNode(nodeId)!;
    const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
    const innerDimensions = calculateInnerDimensions(schema, nodeJson);
    const columnHeight = columnHeights.get(column) ?? nodeBoxSizes.canvasOffset;
    nodeBoxPositions[nodeId] = {
      offsetLeft: nodeBoxSizes.canvasOffset + column * nodeBoxSizes.columnWidth,
      offsetTop: columnHeight,
      ...innerDimensions,
    };

    const newColumnHeight =
      columnHeight + innerDimensions.height + nodeBoxSizes.canvasOffset;
    canvasWidth = Math.max(
      canvasWidth,
      2 * nodeBoxSizes.canvasOffset + (column + 1) * nodeBoxSizes.columnWidth
    );
    canvasHeight = Math.max(canvasHeight, newColumnHeight);
    columnHeights.set(column, newColumnHeight);

    for (const slotName of Object.keys(schema.slots)) {
      if (schema.isCollectionSlot(slotName)) {
        for (const childId of nodeJson.collectionSlots[slotName]) {
          queue.add({ nodeId: childId, column: column + 1 });
        }
      } else {
        const childId = nodeJson.slots[slotName];
        if (childId) queue.add({ nodeId: childId, column: column + 1 });
      }
    }
  }

  return { canvasWidth, canvasHeight, nodeBoxPositions };
}

function calculateInnerDimensions(
  schema: AnyNodeSchema,
  nodeJson: NodeJson
): Pick<NodeBoxPosition, "height" | "inputOffsets" | "outputOffsets"> {
  const inputOffsets: Record<string, number> = {};
  const outputOffsets: Record<string, number> = {};

  let boxHeight =
    nodeBoxSizes.padding + // Top padding
    nodeBoxSizes.header; // Header

  const inputNames = Object.keys(schema.inputs);
  for (const [slotName, slotSchema] of Object.entries(schema.slots)) {
    for (const inputName of Object.keys(slotSchema.inputs ?? {})) {
      const children = nodeJson.collectionSlots[slotName];
      if (children.length) {
        inputNames.push(...children.map((_, i) => `${inputName}/${i}`));
      } else {
        inputNames.push(`${inputName}/-1`);
      }
    }
  }
  if (inputNames.length) {
    boxHeight += nodeBoxSizes.section; // "Inputs" section header

    for (const inputName of inputNames) {
      inputOffsets[inputName] = boxHeight;
      boxHeight += nodeBoxSizes.ioRow;
    }
  }

  const outputNames = [
    ...Object.keys(schema.outputs),
    ...Object.values(schema.slots).flatMap((slotSchema) =>
      Object.keys(slotSchema.outputs ?? {})
    ),
  ];
  if (outputNames.length) {
    boxHeight += nodeBoxSizes.section; // "Outputs" section header

    for (const outputName of Object.keys(schema.outputs)) {
      outputOffsets[outputName] = boxHeight;
      boxHeight += nodeBoxSizes.ioRow;
    }
  }

  return {
    height: boxHeight + nodeBoxSizes.padding,
    inputOffsets,
    outputOffsets,
  };
}

/**
 * All heights in px.
 */
const nodeBoxSizes = {
  /**
   * Minimum distance between the canvas top/left edge and the NodeBox top/left
   * edge.
   */
  canvasOffset: 16,

  /**
   * The `NodeBox` width is 320px.
   */
  columnWidth: 400,

  /**
   * Top padding (between NodeBox top edge and header) and bottom padding
   * (between last element and NodeBox bottom edge).
   */
  padding: 8,

  /**
   * The header element is always visible and contains the node id and type.
   */
  header: 48,

  /**
   * Height of the "Inputs"/"Outputs" section dividers. Section dividers only
   * get rendered if the node has inputs/outputs.
   */
  section: 24,

  /**
   * Each input/output has a height of 48px. The center of the connector has a
   * vertical offset of 24px, and a horizontal offset of 4px from the NodeBox
   * edge.
   */
  ioRow: 48,
};
