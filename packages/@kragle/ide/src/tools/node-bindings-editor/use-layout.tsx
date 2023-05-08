import { NodeJson, NodeSchema, SceneDocument } from "@kragle/runtime";

export function useLayout(document: SceneDocument) {
  return calculateLayout2(document);
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

export interface Layout2 {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly NodeBoxes: Map<string, [number, number]>;
  /**
   * Map<NodeID, [Xcoordinate, Ycoordinate, NodeID]>
   */
  readonly Paths: Map<
    string,
    [XCoordinate: number, YCoodrinate: number, NodeID: string]
  >;
}

interface nodesBox {
  readonly column: number;
  row?: [number, number];
  Xcoordinate?: number;
  Ycoordinate?: number;
  readonly ID: string;
  readonly inputs: Array<string>;
  /**
   * Map<columnfrom-columnto,  Set<nodeIDs>>
   */
  readonly connections: Map<string, Set<string>>;
  /**
   * Array<[strength_of_group, groupID]>
   */
  group?: Array<[string, number]>;
}

function calculateLayout2(document: SceneDocument): Layout {
  /*
  let nodeid = document.getRootNodeId()
  let nodeJson = document.getNode(nodeid!)
  let childids = Object.values(nodeJson!.slots)
  let schema = document.nodeDefinitions.get(nodeJson!.type)!.schema
  let inputNames = Object.keys(schema.inputs)
  let outputNames = Object.keys(schema.outputs)
  let binding = nodeJson!.inputs[inputNames[0]]
  */

  // input initiating
  let allnodes: Map<string, nodesBox> = new Map();
  let root: nodesBox = {
    column: 0,
    row: [0, -1],
    ID: document.getRootNodeId()!,
    inputs: new Array(),
    connections: new Map(),
  };
  allnodes.set(document.getRootNodeId()!, root);

  // input unzip
  let children: Array<string> = Object.values(document.getNode(root.ID)!.slots);
  let grandchildren: Array<string> = [];
  let depth: number = 1;
  do {
    for (let c of children) {
      let nodeJson = document.getNode(c);
      let inputNames = Object.keys(
        document.nodeDefinitions.get(nodeJson!.type)!.schema.inputs
      );
      let inputIDs: Array<string> = new Array();
      for (let i of inputNames) {
        let binding = nodeJson!.inputs[i];
        if (!binding) {
          continue;
        }
        if (binding.type !== "node-output") {
          continue;
        }
        inputIDs.push(binding.nodeId);
      }
      let child: nodesBox = {
        column: depth,
        row: [-1, -1],
        ID: c,
        inputs: inputIDs,
        connections: new Map(),
      };
      allnodes.set(c, child);
      let grandchildrencheck = Object.values(nodeJson!.slots);
      if (grandchildrencheck.length == 0) {
        continue;
      }
      grandchildren = grandchildren.concat(grandchildrencheck);
    }
    children = [];
    if (grandchildren.length > 0) {
      children = grandchildren;
      grandchildren = new Array();
      depth += 1;
    }
  } while (children.length > 0);

  // connections find
  let gap = "-";
  for (let n of allnodes.values()) {
    if (n.inputs.length == 0) {
      continue;
    }
    for (let c of n.inputs) {
      let column_from = allnodes.get(c)!.column;
      let column_too = n.column;
      let connection = column_from.toString() + gap + column_too.toString();
      if (!n.connections.has(connection)) {
        n.connections.set(connection, new Set());
      }
      n.connections.get(connection)!.add(c);
    }
  }

  // grouping sort initiating
  /**
   * Map<columnfrom-columnto, Set<nodeID>>
   */
  let groups: Map<string, Set<string>> = new Map();
  for (let n of allnodes.values()) {
    if (n.connections.size == 0) {
      continue;
    }
    for (let c of n.connections) {
      if (!groups.has(c[0])) {
        groups.set(c[0], new Set());
      }
      groups.get(c[0])?.add(n.ID);
    }
  }

  // grouping filter
  /*
  for (let g in groups)
  {
    if (groups.get(g)!.size >= 2)
    {
      continue;
    }
    groups.delete(g);
  }
  */

  // grouping clusters
  let groupmaxsize: number = 0;
  for (let g of groups.values()) {
    //finding groupmaxsize for groupweight
    let s: number = g.size;
    if (s <= groupmaxsize) {
      continue;
    }
    groupmaxsize = s;
  }
  /**
   * Map<column, Map<columnfrom-columnto, weight>>
   */
  let clusters: Map<number, Map<string, number>> = new Map();
  for (let i = 0; i <= depth; i++) {
    //filling clusters to match depth of tree
    clusters.set(i, new Map());
  }
  for (let g of groups) {
    //sorting connections into columns
    let columnfrom: number = parseInt(g[0].slice(0, g[0].indexOf("-")));
    let columnto: number = parseInt(g[0].slice(g[0].indexOf("-") + 1));
    let groupweight: number = g[1].size / groupmaxsize;
    let stretch: number = 1 - (columnto - columnfrom) / depth;
    clusters.get(columnto)!.set(g[0], (groupweight + stretch) / 2);
  }

  // sorting groups in rows
  /**
   * Map<column, Array<sortet columnfrom-columnto>>
   */
  let rowslayout: Map<number, Array<string>> = new Map();
  for (let c of clusters.entries()) {
    let rowzip: Array<[string, number]> = [];
    for (let e of c[1].entries()) {
      rowzip.push(e);
    }
    rowzip.sort(function (a, b) {
      return b[1] - a[1];
    });
    let row: Array<string> = [];
    rowzip.forEach(function (value) {
      row.push(value[0]);
    });
    rowslayout.set(c[0], row);
  }

  // weight arrays
  for (let n of allnodes.values()) {
    let weightarray: Array<[string, number]> = [];
    for (let c of n.connections) {
      weightarray.push([c[0], clusters.get(n.column)!.get(c[0])! * c[1].size]);
    }
    // sort weight array
    weightarray.sort(function (a, b) {
      return b[1] - a[1];
    });
    n.group = weightarray;
  }

  // assigning places
  // doal weight
  for (let n of allnodes.values()) {
    let a: number = -1;
    if (n.group!.length > 0) {
      a = rowslayout.get(n.column)!.indexOf(n.group![0][0]);
    }
    let b: number = -1;
    if (n.group!.length > 1) {
      n.group![1][1];
    }
    n.row = [a, b];
  }

  // creating layout
  // dual weight
  let outputraw: Array<Array<string>> = [];
  for (let d = 0; d <= depth; d++) {
    let columnraw: Array<[string, number, number]> = [];
    for (let n of allnodes.values()) {
      if (n.column != d) {
        continue;
      }
      columnraw.push([n.ID, n.row![0], n.row![1]]);
    }
    columnraw.sort(function (a, b) {
      return a[1] * 10 + a[2] - (b[1] * 10 + b[2]);
    });
    let columnlayout: Array<string> = [];
    columnraw.forEach(function (value) {
      columnlayout.push(value[0]);
    });
    outputraw.push(columnlayout);
  }

  // compiling layout
  // dual weight
  // no tunnels
  let output: Record<string, NodeBoxPosition> = {};
  let width: number = 16;
  let maxheight: number = 0;
  for (let c of outputraw) {
    width = width + 400;
    let height: number = 0;
    for (let r of c) {
      let offsetLeft: number = 16 + 400 * allnodes.get(r)!.column;
      let nodeJson = document.getNode(r);
      let innerDimensions = calculateInnerDimensions(
        document.nodeDefinitions.get(nodeJson!.type)!.schema,
        nodeJson!
      );
      output[r] = {
        offsetLeft: offsetLeft,
        offsetTop: height + 16,
        ...innerDimensions,
      };
      height = height + 16 + innerDimensions.height;
      if (maxheight < height) {
        maxheight = height;
      }
    }
  }

  return {
    canvasWidth: width,
    canvasHeight: maxheight,
    nodeBoxPositions: output,
  };
}

function calculateInnerDimensions(
  schema: NodeSchema,
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

  connectorOffsetX: 8,
  connectorOffsetY: 24,
};
