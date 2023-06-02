import { NodeJson, NodeSchema, SceneDocument } from "@kragle/runtime";

export function useLayout(document: SceneDocument) {
  return calculateLayout(document);
}

export interface Layout {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly nodeBoxPositions: Readonly<Record<string, NodeBoxPosition>>;
}

interface NodeBoxDimensions {
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

export interface NodeBoxPosition extends NodeBoxDimensions {
  /**
   * Distance between the canvas left edge and the NodeBox left edge in px.
   */
  readonly offsetLeft: number;

  /**
   * Distance between the canvas top edge and the NodeBox top edge in px.
   */
  readonly offsetTop: number;
}

function calculateLayout(document: SceneDocument): Layout {
  const dimensionsMap = new Map<string, NodeBoxDimensions>();
  const treeHeightsMap = new Map<string, number>();
  calculateTreeHeight(
    dimensionsMap,
    treeHeightsMap,
    document.getRootNodeId()!,
    document
  );

  const nodeBoxPositions: Record<string, NodeBoxPosition> = {};
  for (const [nodeId, dimensions] of dimensionsMap) {
    nodeBoxPositions[nodeId] = { ...dimensions, ...positions[nodeId] };
  }

  let canvasWidth = 0;
  let canvasHeight = 0;
  for (const boxPosition of Object.values(nodeBoxPositions)) {
    canvasWidth = Math.max(
      canvasWidth,
      boxPosition.offsetLeft + nodeBoxSizes.boxWidth + nodeBoxSizes.canvasOffset
    );
    canvasHeight = Math.max(
      canvasHeight,
      boxPosition.offsetTop + boxPosition.height + nodeBoxSizes.canvasOffset
    );
  }

  return { canvasWidth, canvasHeight, nodeBoxPositions };
}

const positions: Record<
  string,
  {
    offsetLeft: number;
    offsetTop: number;
  }
> = {
  ArticlcesRepository: {
    offsetLeft: 0,
    offsetTop: 1336,
  },
  PageLayout: {
    offsetLeft: 480,
    offsetTop: 1090,
  },
  PageTitle: {
    offsetLeft: 960,
    offsetTop: 8,
  },
  NewArticleDialog: {
    offsetLeft: 960,
    offsetTop: 312,
  },
  NewArticleButton: {
    offsetLeft: 1440,
    offsetTop: 208,
  },
  NewArticleBloc: {
    offsetLeft: 1440,
    offsetTop: 552,
  },
  ArticlesTable: {
    offsetLeft: 960,
    offsetTop: 818,
  },
  IdColumn: {
    offsetLeft: 1440,
    offsetTop: 784,
  },
  IdColumnText: {
    offsetLeft: 1920,
    offsetTop: 784,
  },
  NameColumn: {
    offsetLeft: 1440,
    offsetTop: 1056,
  },
  NameColumnText: {
    offsetLeft: 1920,
    offsetTop: 1056,
  },
  PriceColumn: {
    offsetLeft: 1440,
    offsetTop: 1664,
  },
  PriceColumnText: {
    offsetLeft: 1920,
    offsetTop: 1664,
  },
  EditColumn: {
    offsetLeft: 1440,
    offsetTop: 2392,
  },
  EditArticleButton: {
    offsetLeft: 1920,
    offsetTop: 1936,
  },
  EditArticleBloc: {
    offsetLeft: 1920,
    offsetTop: 2500,
  },
  EditArticleFormLayout: {
    offsetLeft: 2400,
    offsetTop: 2368,
  },
  EditArticleNameTextField: {
    offsetLeft: 2880,
    offsetTop: 2278,
  },
  EditArticlePriceTextField: {
    offsetLeft: 2880,
    offsetTop: 2528,
  },
  UpdateArticleButton: {
    offsetLeft: 2880,
    offsetTop: 2776,
  },
};

/**
 * Fills `innerDimensionsMap`, `treeHeightsMap` and `columnsMap` in-place.
 */
function calculateTreeHeight(
  dimensionsMap: Map<string, NodeBoxDimensions>,
  treeHeightsMap: Map<string, number>,
  nodeId: string,
  document: SceneDocument
) {
  const nodeJson = document.getNode(nodeId)!;
  const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
  const innerDimensions = calculateNodeBoxDimensions(schema, nodeJson);
  dimensionsMap.set(nodeId, innerDimensions);

  let totalChildrenHeight = 0;
  for (const slotName of Object.keys(schema.slots)) {
    if (schema.isCollectionSlot(slotName)) {
      for (const childId of nodeJson.collectionSlots[slotName]) {
        calculateTreeHeight(dimensionsMap, treeHeightsMap, childId, document);
        totalChildrenHeight +=
          treeHeightsMap.get(childId)! + nodeBoxSizes.canvasOffset;
      }
    } else {
      const childId = nodeJson.slots[slotName];
      if (!childId) continue;
      calculateTreeHeight(dimensionsMap, treeHeightsMap, childId, document);
      totalChildrenHeight +=
        treeHeightsMap.get(childId)! + nodeBoxSizes.canvasOffset;
    }
  }
  treeHeightsMap.set(
    nodeId,
    Math.max(
      innerDimensions.height + nodeBoxSizes.canvasOffset,
      totalChildrenHeight
    )
  );
}

function calculateNodeBoxPosition(
  nodeBoxPositions: Record<string, NodeBoxPosition>,
  dimensionsMap: ReadonlyMap<string, NodeBoxDimensions>,
  treeHeightsMap: ReadonlyMap<string, number>,
  document: SceneDocument,
  nodeId: string,
  offsetY: number,
  column = 0
) {
  const dimensions = dimensionsMap.get(nodeId)!;
  nodeBoxPositions[nodeId] = {
    offsetLeft: column * nodeBoxSizes.columnWidth,
    offsetTop: offsetY + (treeHeightsMap.get(nodeId)! - dimensions.height) / 2,
    ...dimensions,
  };

  const nodeJson = document.getNode(nodeId)!;
  const { schema } = document.nodeDefinitions.get(nodeJson.type)!;
  for (const slotName of Object.keys(schema.slots)) {
    if (schema.isCollectionSlot(slotName)) {
      for (const childId of nodeJson.collectionSlots[slotName]) {
        calculateNodeBoxPosition(
          nodeBoxPositions,
          dimensionsMap,
          treeHeightsMap,
          document,
          childId,
          offsetY,
          column + 1
        );
        offsetY += treeHeightsMap.get(childId)!;
      }
    } else {
      const childId = nodeJson.slots[slotName];
      if (!childId) continue;
      calculateNodeBoxPosition(
        nodeBoxPositions,
        dimensionsMap,
        treeHeightsMap,
        document,
        childId,
        offsetY,
        column + 1
      );
      offsetY += treeHeightsMap.get(childId)!;
    }
  }
}

function calculateNodeBoxDimensions(
  schema: NodeSchema,
  nodeJson: NodeJson
): NodeBoxDimensions {
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

    for (const outputName of outputNames) {
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
export const nodeBoxSizes = {
  /**
   * Minimum distance between the canvas top/left edge and the NodeBox top/left
   * edge.
   */
  canvasOffset: 16,

  boxWidth: 320,
  columnWidth: 480,

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

  connectorOffsetX: 8,
  connectorOffsetY: 24,
};
