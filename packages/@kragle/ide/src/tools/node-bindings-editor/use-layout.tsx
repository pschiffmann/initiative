import { NodeJson, NodeSchema, SceneDocument } from "@kragle/runtime";

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

interface nodeBox0 {
  readonly ID: string;
  readonly column: number;
  readonly parent: string;
  readonly inputs: Array<string>;
  readonly outputs: Array<string>;
  readonly size: number;
  chain: [length: number, size: number];
  centerline?: number;
  position?: [Xcoordinate: number, Ycoordinate: number];
  /**
   * Stores Tunnels to connect to as tunnelIDs.
   */
  connections?: Array<string>;
}
function calculateLayout(document: SceneDocument): Layout {
  /*
  let nodeid = document.getRootNodeId()
  let nodeJson = document.getNode(nodeid!)
  let childids = Object.values(nodeJson!.slots)
  let schema = document.nodeDefinitions.get(nodeJson!.type)!.schema
  let inputNames = Object.keys(schema.inputs)
  let outputNames = Object.keys(schema.outputs)
  let binding = nodeJson!.inputs[inputNames[0]]
  */

  // input unzip
  let allnodes: Map<string, nodeBox0> = new Map();
  let root: nodeBox0 = {
    ID: document.getRootNodeId()!,
    column: 0,
    parent: "",
    chain: [0, 0],
    inputs: Object.keys(
      document.nodeDefinitions.get(
        document.getNode(document.getRootNodeId()!)!.type
      )!.schema.inputs
    ),
    outputs: Object.keys(
      document.nodeDefinitions.get(
        document.getNode(document.getRootNodeId()!)!.type
      )!.schema.outputs
    ),
    size: calculateInnerDimensions(
      document.nodeDefinitions.get(
        document.getNode(document.getRootNodeId()!)!.type
      )!.schema,
      document.getNode(document.getRootNodeId()!)!
    ).height,
    position: [0, 0],
    connections: new Array(),
  };
  let columns: Map<number, Set<string>> = new Map();
  columns.set(0, new Set());
  columns.get(0)!.add(root.ID);
  allnodes.set(root.ID, root);
  let children: Array<[string, Array<string>]> = new Array([
    root.ID,
    Object.values(document.getNode(root.ID)!.slots),
  ]);
  let grandchildren: Array<[string, Array<string>]> = new Array();
  let depth: number = 1;
  do {
    for (let [p, cs] of children) {
      for (let c of cs) {
        let child: nodeBox0 = {
          ID: c,
          column: depth,
          parent: p,
          chain: [0, 0],
          inputs: Object.keys(
            document.nodeDefinitions.get(document.getNode(c)!.type)!.schema
              .inputs
          ),
          outputs: Object.keys(
            document.nodeDefinitions.get(document.getNode(c!)!.type)!.schema
              .outputs
          ),
          size: calculateInnerDimensions(
            document.nodeDefinitions.get(document.getNode(c)!.type)!.schema,
            document.getNode(c)!
          ).height,
        };
        allnodes.set(c, child);
        if (!columns.has(depth)) {
          columns.set(depth, new Set());
        }
        columns.get(depth)!.add(c);
        if (Object.values(document.getNode(c)!.slots).length == 0) {
          continue;
        }
        grandchildren.push([c, Object.values(document.getNode(c)!.slots)]);
      }
    }
    children = new Array();
    if (grandchildren.length > 0) {
      children = grandchildren;
      depth += 1;
    }
    grandchildren = new Array();
  } while (children.length > 0);

  // Chains
  for (let d = depth; d > 0; d--) {
    for (let n of columns.get(d)!.values()) {
      let node = allnodes.get(n)!;
      allnodes.get(node.parent)!.chain[0] += node.chain[0] + 1;
      allnodes.get(node.parent)!.chain[1] += 1;
    }
  }

  // Parenting
  /**
   * Map<column, Map<parentID, Map<childID, size>>>
   */
  let superstructur: Map<number, Map<string, Map<string, number>>> = new Map();
  for (let d = 0; d <= depth; d++) {
    superstructur.set(d, new Map());
  }
  for (let [d, parents] of columns) {
    for (let p of parents) {
      superstructur.get(d)!.set(p, new Map());
    }
  }
  for (let n of allnodes.values()) {
    if (n.column == 0) {
      continue;
    }
    superstructur
      .get(n.column - 1)!
      .get(n.parent)!
      .set(n.ID, n.size);
  }
  for (let n of allnodes.values()) {
    if (n.column - 2 <= 0) {
      continue;
    }
    let bindings = document.getNode(n.ID)!.inputs;
    for (let i of n.inputs) {
      let bind = bindings[i];
      if (!bind) {
        continue;
      }
      if (bind.type !== "node-output") {
        continue;
      }
      if (bind.nodeId == n.parent) {
        continue;
      }
      for (let d = n.column - 1; d >= 0; d--) {
        if (superstructur.get(d)!.has(bind.nodeId)) {
          break;
        }
        if (!superstructur.get(d)!.has("tunnel")) {
          superstructur.get(d)!.set("tunnel", new Map());
        }
        if (!superstructur.get(d)!.get("tunnel")!.has(bind.nodeId)) {
          superstructur.get(d)!.get("tunnel")!.set(bind.nodeId, 0);
        }
        let tunnelcurrentsize = superstructur
          .get(d)!
          .get("tunnel")!
          .get(bind.nodeId)!;
        superstructur
          .get(d)!
          .get("tunnel")!
          .set(bind.nodeId, tunnelcurrentsize + 5);
      }
    }
  }

  // largest column
  let largestcolumnsize: number = 0;
  let largestcolumnID: number;
  for (let [column, data] of superstructur) {
    let columnsize: number = 0;
    for (let node of data.keys()) {
      if (node == "tunnel") {
        for (let tunnel of data.get(node)!.values()) {
          columnsize += tunnel;
        }
        continue;
      }
      columnsize += allnodes.get(node)!.size;
    }
    if (columnsize >= largestcolumnsize) {
      largestcolumnsize = columnsize;
      largestcolumnID = column;
    }
  }
  root.centerline = root.size / 2;
  root.position = [0, 0];

  // geography
  let gcolumns: Map<
    string,
    [
      [length: number, size: number],
      Array<[ID: string, length: number, size: number]>
    ]
  > = new Map();

  for (let column of columns.values()) {
    for (let n of column) {
      let node = allnodes.get(n)!;
      if (!gcolumns.has(node.parent)) {
        gcolumns.set(node.parent, [[0, 0], new Array()]);
      }
      let gcx = gcolumns.get(node.parent)![0];
      gcx[0] = Math.max(gcx[0], node.chain[0]);
      gcx[1] = Math.max(gcx[1], node.chain[1]);
      gcolumns
        .get(node.parent)![1]
        .push([node.ID, node.chain[0], node.chain[1]]);
    }
    console.log(gcolumns);
    for (let p of gcolumns.values()) {
      p[1].sort(function (a, b) {
        return b[1] + b[2] / 10 - (a[1] + a[2] / 10);
      });
    }
  }

  console.log(gcolumns);
  // 1d
  for (let [parent, group] of gcolumns) {
    //let column: number = allnodes.get(parent)!.column;
    let offset: number = 0;
    for (let [childID, childlength, childsize] of group[1]) {
      if (parent !== "") {
        allnodes.get(childID)!.position = [
          0,
          allnodes.get(parent)!.centerline! + offset,
        ];
      }
      offset += allnodes.get(childID)!.size;
      console.log(offset);
      allnodes.get(childID)!.centerline =
        allnodes.get(childID)!.position![1] + allnodes.get(childID)!.size / 2;
    }
  }

  // width
  let maxwidth: number = 400;
  let maxangle: number = 45;
  for (let [d, c] of columns) {
    if (d == 0) {
      continue;
    }
    let parenthight: number = 0;
    let childrenhight: number = 0;
    for (let pc of columns.get(d - 1)!) {
      parenthight += allnodes.get(pc)!.size;
    }
    for (let cc of c) {
      childrenhight += allnodes.get(cc)!.size;
    }
    maxwidth += Math.sqrt(
      Math.pow(parenthight / Math.sin(maxangle), 2) - Math.pow(parenthight, 2)
    );
    for (let cc of c) {
      allnodes.get(cc)!.position![0] = maxwidth;
    }
    maxwidth += 400;
  }

  // search maxhight
  let maxheight: number = 0;
  for (let n of allnodes.values()) {
    maxheight = Math.max(maxheight, n.position![1] + n.size);
  }

  // sample output 2
  let sampleoutput2: Record<string, NodeBoxPosition> = {};
  for (let n of allnodes.values()) {
    let nodeJson = document.getNode(n.ID);
    let innerDimensions = calculateInnerDimensions(
      document.nodeDefinitions.get(nodeJson!.type)!.schema,
      nodeJson!
    );
    sampleoutput2[n.ID] = {
      offsetLeft: n.position![0],
      offsetTop: n.position![1],
      ...innerDimensions,
    };
  }
  return {
    canvasWidth: maxwidth,
    canvasHeight: maxheight,
    nodeBoxPositions: sampleoutput2,
  };

  // size sorting
  let sizedsuper: Map<
    number,
    Array<[nodeID: string, size: number]>
  > = new Map();
  for (let [column, data] of superstructur) {
    sizedsuper.set(column, new Array());
    for (let [parentID, children] of data) {
      let parentsize: number = 0;
      for (let [childID, childsize] of children) {
        parentsize += childsize;
      }
      if (parentID !== "tunnel") {
        if (parentsize < allnodes.get(parentID)!.size) {
          parentsize = allnodes.get(parentID)!.size;
        }
      }
      sizedsuper.get(column)!.push([parentID, parentsize]);
    }
    // sort
    let sorted = sizedsuper.get(column)!.sort(function (a, b) {
      return b[1] - a[1];
    });
    sizedsuper.set(column, sorted);
  }

  // sample output for debugging and thinking
  let sampleoutput: Record<string, NodeBoxPosition> = {};
  let width: number = 0;
  //let maxheight: number = largestcolumnsize * 2;
  let centerline: number = largestcolumnsize / 2;
  for (let [column, data] of sizedsuper) {
    let plus: number = 0;
    let minus: number = 0;
    let alternate: Boolean = true;
    let alternatecheck: string = root.parent;
    for (let [nodeID, size] of data) {
      if (alternate) {
        if (nodeID !== "tunnel") {
          allnodes.get(nodeID)!.position = [width, centerline + plus];
          if (alternatecheck !== allnodes.get(nodeID)!.parent) {
            alternatecheck = allnodes.get(nodeID)!.parent;
            alternate = false;
          }
        }
        plus += size;
      } else {
        if (nodeID !== "tunnel") {
          allnodes.get(nodeID)!.position = [width, centerline - (minus + size)];
          if (alternatecheck !== allnodes.get(nodeID)!.parent) {
            alternatecheck = allnodes.get(nodeID)!.parent;
            alternate = true;
          }
        }
        minus += size;
      }
    }
    width += 400;
  }
  for (let n of allnodes.values()) {
    let nodeJson = document.getNode(n.ID);
    let innerDimensions = calculateInnerDimensions(
      document.nodeDefinitions.get(nodeJson!.type)!.schema,
      nodeJson!
    );
    sampleoutput[n.ID] = {
      offsetLeft: n.position![0],
      offsetTop: n.position![1],
      ...innerDimensions,
    };
  }
  return {
    canvasWidth: width,
    canvasHeight: maxheight,
    nodeBoxPositions: sampleoutput,
  };
}

interface nodesBox {
  readonly column: number;
  row?: [number, number];
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
  for (let n of allnodes.values()) {
    if (n.inputs.length == 0) {
      continue;
    }
    for (let c of n.inputs) {
      let column_from = allnodes.get(c)!.column;
      let column_too = n.column;
      let connection = `${column_from}-${column_too}`;
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

  // grouping clusters
  let groupmaxsize: number = 0;
  for (let g of groups.values()) {
    //finding groupmaxsize for groupweight
    groupmaxsize = Math.max(groupmaxsize, g.size);
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
      return a[1] - b[1];
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
  // dual weight
  for (let n of allnodes.values()) {
    let a: number = -1;
    let b: number = -1;
    if (n.group!.length > 0) {
      a = rowslayout.get(n.column)!.indexOf(n.group![0][0]);
      b = n.group![0][1];
    }
    if (n.group!.length > 1) {
      b = n.group![1][1];
    }
    n.row = [a, b];
  }

  // creating layout
  // dual weight
  /* 2d
  let outputraw: Array<Array<[string, number]>> = [];
  */
  // 1d
  let outputraw: Array<Array<string>> = [];
  //*/
  for (let d = 0; d <= depth; d++) {
    let columnraw: Array<[string, number, number]> = [];
    for (let n of allnodes.values()) {
      if (n.column != d) {
        continue;
      }
      columnraw.push([n.ID, n.row![0], n.row![1]]);
    }
    columnraw.sort(function (a, b) {
      return b[1] * 10 + b[2] - (a[1] * 10 + a[2]);
    });
    /* 2d
    let columnlayout: Array<[string, number]> = [];
    let alternate: number = 0;
    let direction: Boolean = true;
    columnraw.forEach(function (value)
    {
      if (alternate != value[1])
      {
        alternate = value[1];
        direction = !direction;
      }
      if (direction)
      {
        columnlayout.push([value[0], 1]);
      } else {
        columnlayout.unshift([value[0], -1]);
      }
    })
    outputraw.push(columnlayout);
    */
    //*/ 1d
    let columnlayout: Array<string> = [];
    columnraw.forEach(function (value) {
      columnlayout.push(value[0]);
    });
    outputraw.push(columnlayout);
    //*/
  }

  // compiling layout
  // dual weight
  // no tunnels
  // 1d
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
