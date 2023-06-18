import { NodeJson, NodeSchema, SceneDocument } from "@kragle/runtime";

export function useLayout(document: SceneDocument) {
  //return calculateLayout2(document);
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

interface box {
  readonly id: string;
  readonly column: number;
  readonly parent: string;
  readonly size: number;
  readonly innerD: any;
  readonly chain: [length: number, size: number];
  position: [xCoordinate: number, yCoordinate: number];
  readonly inputs: Array<string>;
}

function calculateLayout3(document: SceneDocument) {
  const allNodes: Map<string, box> = new Map();
  /**
   * Will unpack all nodes from the Scenedocument into allNodes Map.
   * Recursive!
   * @param nodeID Unique node name
   * @param nodeparent Node Id of parent node to establish parent child connections
   * @param column depth level of the node in the scene document ancestry
   * @returns chain length value needed to sort nodes
   */
  function unzip(nodeID: string, nodeparent: string, column: number): number {
    const nodeJson = document.getNode(nodeID)!;
    const schema = document.nodeDefinitions.get(nodeJson!.type)!.schema;
    const childIDs = Object.values(nodeJson!.slots);
    const chainraw: [number, number] = [0, childIDs.length];
    if (chainraw[1] > 0) {
      for (const child of childIDs) {
        chainraw[0] += unzip(child, nodeID, column + 1);
      }
    }
    const dimensions = calculateInnerDimensions(schema, nodeJson);
    let inputs: Array<string> = new Array();
    const rawinputs = Object.keys(schema.inputs);
    for (const raw of rawinputs) {
      const binding = nodeJson!.inputs[raw];
      if (binding == undefined) continue;
      if (binding.type !== "node-output") continue;
      inputs.push(binding.nodeId);
    }
    const node: box = {
      id: nodeID,
      column: column,
      parent: nodeparent,
      size: dimensions.height,
      innerD: dimensions,
      chain: chainraw,
      position: [0, 0],
      inputs: inputs,
    };
    allNodes.set(nodeID, node);
    return chainraw[0] + 1;
  }

  unzip(document.getRootNodeId()!, "", 0);

  const allColumns: Map<number, Set<string>> = new Map();
  for (const node of allNodes.values()) {
    if (!allColumns.has(node.column)) allColumns.set(node.column, new Set());
    allColumns.get(node.column)!.add(node.id);
  }

  const allConnections: Map<number, Map<number, number>> = new Map();
  for (const node of allNodes.values()) {
    const to = node.column;
    for (const connection of node.inputs) {
      const from = allNodes.get(connection)!.column;
      if (!allConnections.has(from)) allConnections.set(from, new Map());
      if (!allConnections.get(from)!.has(to))
        allConnections.get(from)!.set(to, 0);
      allConnections.get(from)!.set(to, allConnections.get(from)!.get(to)! + 1);
    }
  }

  /**
   * To change a list from a slope to a pyramid.
   * @param list sorted list high->low | low->high
   * @returns list low->high->low | high->low->high
   */
  function pyramid(list: Array<string>): Array<string> {
    const output: Array<string> = new Array();
    let alternate: Boolean = true;
    for (const item of list) {
      if (alternate) {
        output.push(item);
        alternate = false;
      } else {
        output.unshift(item);
        alternate = true;
      }
    }
    return output;
  }

  const maxdepth: number = allColumns.size - 1;
  const geographyFirstSort: Map<number, Array<string>> = new Map();
  // needed to establish original node positions to find optimal tunnel placement
  // sorts all nodes by their chains, behind their parents
  for (let depth = 0; depth <= maxdepth; depth++) {
    geographyFirstSort.set(depth, new Array());
    if (depth === 0) {
      for (const nodeId of allColumns.get(depth)!.values()) {
        geographyFirstSort.get(depth)!.push(nodeId);
      }
      continue;
    }
    const columnNodes: Map<string, Array<string>> = new Map();
    for (const nodeId of allColumns.get(depth)!.values()) {
      const node = allNodes.get(nodeId)!;
      if (!columnNodes.has(node.parent))
        columnNodes.set(node.parent, new Array());
      columnNodes.get(node.parent)!.push(node.id);
    }
    for (const [parent, nodes] of columnNodes) {
      let unsortedList: Array<[string, number, number]> = new Array();
      for (const nodeId of nodes) {
        const node = allNodes.get(nodeId)!;
        unsortedList.push([node.id, node.chain[0], node.chain[1]]);
      }
      unsortedList.sort(function (a, b) {
        return a[1] * 100 + a[2] - (b[1] * 100 + b[2]);
      });
      let sortedList: Array<string> = new Array();
      unsortedList.forEach(function (a) {
        return a[0];
      });
      sortedList = pyramid(sortedList);
      columnNodes.set(parent, sortedList);
    }
    
  }
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
  connections: Array<string>;
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
  /*
    needed to extract information from the SceneDocument
    but not only interaction with it.
    Creates nodeBox0 for each node in SceneDocument.
  */
  const allnodes: Map<string, nodeBox0> = new Map();
  const root: nodeBox0 = {
    // need to create root node seperatly because everything else uses this as a starting point.
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
    position: [15, 0], // 15 to create some space from the edge of the canvas
    connections: new Array(),
  };
  const columns: Map<number, Set<string>> = new Map();
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
    // repeat as long as further children are present.
    for (const [p, cs] of children) {
      for (const c of cs) {
        const child: nodeBox0 = {
          ID: c,
          column: depth,
          parent: p,
          chain: [0, 0],
          inputs: Object.keys(
            document.nodeDefinitions.get(document.getNode(c)!.type)!.schema
              .inputs
          ), // needed for tunnels
          outputs: Object.keys(
            document.nodeDefinitions.get(document.getNode(c!)!.type)!.schema
              .outputs
          ), // needed for tunnels
          size: calculateInnerDimensions(
            document.nodeDefinitions.get(document.getNode(c)!.type)!.schema,
            document.getNode(c)!
          ).height,
          connections: new Array(),
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
    for (const n of columns.get(d)!.values()) {
      const node = allnodes.get(n)!;
      allnodes.get(node.parent)!.chain[0] += node.chain[0] + 1; // the total length is important
      allnodes.get(node.parent)!.chain[1] += 1; // only the child size is important because of child sorting
    }
  }

  // geography
  const gcolumns: Map<
    number,
    Map<
      string, // to order nodes behind parents
      [
        [length: number, size: number], // parents
        Array<[ID: string, length: number, size: number]> // children
      ]
    >
  > = new Map();
  for (const [d, column] of columns) {
    if (!gcolumns.has(d)) {
      gcolumns.set(d, new Map());
    }
    for (const n of column) {
      const node = allnodes.get(n)!;
      if (!gcolumns.get(d)!.has(node.parent)) {
        gcolumns.get(d)!.set(node.parent, [[-1, -1], new Array()]);
      }
      let gcx = gcolumns.get(d)!.get(node.parent)![0];
      if (gcx[0] == -1 && gcx[1] == -1 && node.parent !== "") {
        gcx = allnodes.get(node.parent)!.chain;
      }
      gcolumns.get(d)!.get(node.parent)![0] = gcx;
      gcolumns
        .get(d)!
        .get(node.parent)![1]
        .push([node.ID, node.chain[0], node.chain[1]]);
    }
    for (const p of gcolumns.get(d)!.values()) {
      p[1].sort(function (a, b) {
        return b[1] * 100 + b[2] - (a[1] * 100 + a[2]); // nodes have to be sorted by chain length and size for positioning
      });
    }
    for (const p of gcolumns.get(d)!.values()) {
      if (p[1].length <= 2) {
        continue;
      }
      const raw = new Array();
      let pyramid: boolean = false;
      for (const value of p[1]) {
        // needed to create a pyramid shape with the largest node trees centered
        if (pyramid) {
          raw.unshift(value);
        } else {
          raw.push(value);
        }
      }
      p[1] = raw;
    }
  }

  // 1d
  for (const [d, gcolumn] of gcolumns) {
    let previousgroupmaxposition: number = Number.NEGATIVE_INFINITY; // needed to allow a new row to start at any Ycooridinate
    const sgcolumn: Array<
      //{nodeId: string; group: Array<{childId: string; descendantCount: number; childCount: number }>}
      [string, [[number, number], Array<[string, number, number]>]]
    > = new Array();
    for (const [parent, group] of gcolumn) {
      sgcolumn.push([parent, group]);
    }
    sgcolumn.sort(function (b, a) {
      if (a[0] !== b[0]) {
        const parentCenterlineA = allnodes.get(a[0])!.centerline!;
        const parentCenterlineB = allnodes.get(b[0])!.centerline!;
        return parentCenterlineB - parentCenterlineA;
      }

      return (
        allnodes.get(b[0])!.centerline! - // to always allign nodes to their parents sort by centerline
        allnodes.get(a[0])!.centerline!
      );
    });
    for (const [parent, group] of sgcolumn) {
      let offset: number = 0;
      let groupoffset: number = 0;
      for (const childID of group[1]) {
        groupoffset += allnodes.get(childID[0])!.size;
      }
      groupoffset = groupoffset / 2;
      if (parent !== "") {
        if (
          allnodes.get(parent)!.centerline! - groupoffset <
          previousgroupmaxposition
        ) {
          groupoffset =
            allnodes.get(parent)!.centerline! - previousgroupmaxposition; // if the next group is centered too high it needs to be adjusted down
        }
      }
      for (const [childID, childlength, childsize] of group[1]) {
        const node = allnodes.get(childID)!;
        if (parent !== "") {
          node.position = [
            0,
            allnodes.get(parent)!.centerline! + offset - groupoffset,
          ];
        }
        offset += allnodes.get(childID)!.size;
        previousgroupmaxposition =
          allnodes.get(childID)!.position![1] + allnodes.get(childID)!.size;
        node.centerline = node.position![1] + node.size / 2;
      }
    }
  }

  // create metro
  const metroplan: Map<
    string,
    [outputs: Array<string>, inputs: Array<string>]
  > = new Map();
  for (const node of allnodes.values()) {
    const nodeJson = document.getNode(node.ID);
    for (const input of node.inputs) {
      const binding = nodeJson!.inputs[input];
      if (binding == undefined) {
        continue;
      }
      if (binding.type !== "node-output") {
        continue;
      }
      const origin = allnodes.get(binding.nodeId)!;
      if (node.column - origin.column <= 1) {
        continue;
      }
      const tunnel: string = origin.column + "-" + node.column;
      if (!metroplan.has(tunnel)) {
        metroplan.set(tunnel, [new Array(), new Array()]);
      }
      metroplan.get(tunnel)![0].push(origin.ID);
      metroplan.get(tunnel)![1].push(node.ID);
      node.connections.push(tunnel + node.ID);
    }
  }

  // chart geology
  const soillayout: Array<
    [
      column_start: number,
      column_end: number,
      size: number,
      Ycoordinate: number
    ]
  > = new Array();
  for (const [tunnel, data] of metroplan) {
    const start: number = parseInt(tunnel.slice(0, tunnel.indexOf("-")));
    const end: number = parseInt(tunnel.slice(tunnel.indexOf("-")));
    soillayout.push([start, end, data[0].length, 0]);
  }
  soillayout.sort(function (a, b) {
    return (
      a[1] -
      a[0] +
      (1 - 1 / a[2]) * 10 +
      (1 - 1 / b[0]) -
      ((b[1] - b[0] + (1 - 1 / b[2])) * 10 + (1 - 1 / a[0]))
    );
  });
  // todo
  // insert tunnels

  // 2d
  let maxwidth: number = 415;
  const maxangle: number = 75;
  for (const [d, c] of columns) {
    // assigning an Xcoordinate to each node
    if (d == 0) {
      continue;
    }
    let parenthight: number = 0;
    let childrenhight: number = 0;
    for (const pc of columns.get(d - 1)!) {
      parenthight += allnodes.get(pc)!.size;
    }
    for (const cc of c) {
      childrenhight += allnodes.get(cc)!.size;
    }
    // to calculate the distance between columns the pythegoryan formula is used to limit the maximum angle possible for any connection
    // this needs to be extanded to actually check what connections are present so it can squeeze columns where ever possible
    maxwidth += Math.sqrt(
      Math.pow(parenthight / Math.sin(maxangle * (Math.PI / 180)), 2) -
        Math.pow(parenthight, 2)
    );
    for (const cc of c) {
      allnodes.get(cc)!.position![0] = maxwidth;
    }
    maxwidth += 400;
  }

  // search maxheight
  // since the ouptup needs to be positive only the range of Ycoordinates is checked
  // this should be integrated in the height setting loop
  let maxheight: number = 0;
  let minheight: number = 0;
  for (const n of allnodes.values()) {
    maxheight = Math.max(maxheight, n.position![1] + n.size);
    minheight = Math.min(minheight, n.position![1]);
  }
  maxheight += Math.abs(minheight) + 15; // 15 to add space at the bottom of the canvas

  // correct height
  // height needs to be positive only
  for (const n of allnodes.values()) {
    n.position![1] += Math.abs(minheight) + 15; // 15 to add space at the top of the canvas
  }

  // sample output 2
  const sampleoutput2: Record<string, NodeBoxPosition> = {};
  for (const n of allnodes.values()) {
    const nodeJson = document.getNode(n.ID);
    const innerDimensions = calculateInnerDimensions(
      // should be done in unzip but done here for testing convinience
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
    canvasWidth: maxwidth + 15, // 15 to add space on the right side of the canvas
    canvasHeight: maxheight,
    nodeBoxPositions: sampleoutput2,
  };
}

interface nodeBox {
  readonly ID: string;
  readonly parentID: string;
  readonly dimensions: any;
  readonly column: number;
  readonly inputs: Array<string>;
  readonly outputs: Array<string>;
  readonly children: Array<string>;
  readonly chain: [length: number, size: number];
  position: [Xcoordinate: number, Ycoordinate: number];
}

function calculateLayout2(document: SceneDocument): Layout {
  const allnodeS: Map<string, nodeBox> = new Map();
  const allcolumnS: Map<number, Array<string>> = new Map();
  const parentsizeS: Map<string, number> = new Map();

  function unzip(nodeID: string, nodeparent: string, column: number): number {
    const nodeJson = document.getNode(nodeID)!;
    const schema = document.nodeDefinitions.get(nodeJson!.type)!.schema;
    const childIDs = Object.values(nodeJson!.slots);
    const chainraw: [number, number] = [0, childIDs.length];
    if (chainraw[1] > 0) {
      for (const child of childIDs) {
        chainraw[0] += unzip(child, nodeID, column + 1);
      }
    }
    const node: nodeBox = {
      ID: nodeID,
      parentID: nodeparent,
      dimensions: calculateInnerDimensions(schema, nodeJson),
      column: column,
      inputs: Object.keys(schema.inputs),
      outputs: Object.keys(schema.outputs),
      children: childIDs,
      chain: chainraw,
      position: [0, 0],
    };
    allnodeS.set(nodeID, node);
    if (!allcolumnS.has(column)) {
      allcolumnS.set(column, new Array());
    }
    allcolumnS.get(column)!.push(nodeID);
    if (!parentsizeS.has(nodeparent)) {
      parentsizeS.set(nodeparent, 0);
    }
    parentsizeS.set(
      nodeparent,
      parentsizeS.get(nodeparent) + node.dimensions.height
    );
    return chainraw[0] + 1;
  }
  unzip(document.getRootNodeId()!, "", 0);

  function pyramid(ramparray: Array<string>): Array<string> {
    const output: Array<any> = new Array();
    let alternate: boolean = true;
    for (const element of ramparray) {
      if (alternate) {
        output.push(element);
      } else {
        output.unshift(element);
      }
      alternate != alternate;
    }
    return output;
  }

  // sorting
  for (let column = 0; column < allcolumnS.size; column++) {
    // recursions are stupid, everything is out of order
    let nodeS = allcolumnS.get(column)!;
    if (column === 0) {
      continue;
    }
    const subdevidedsortetcolumnS: Map<string, Array<string>> = new Map();
    for (const nodeID of nodeS) {
      const node = allnodeS.get(nodeID)!;
      if (!subdevidedsortetcolumnS.has(node.parentID)) {
        subdevidedsortetcolumnS.set(node.parentID, new Array());
      }
      subdevidedsortetcolumnS.get(node.parentID)!.push(node.ID);
    }
    const sortedcolumnS: Array<Array<string>> = new Array();
    for (const [parent, sdscolumn] of subdevidedsortetcolumnS) {
      sdscolumn.sort(function (a, b) {
        const nodeA = allnodeS.get(a)!;
        const nodeB = allnodeS.get(b)!;
        return (
          nodeA.chain[0] +
          (1 - 1 / (nodeA.chain[1] + (1 - 1 / nodeA.dimensions.height))) -
          nodeB.chain[0] +
          (1 - 1 / (nodeB.chain[1] + (1 - 1 / nodeB.dimensions.height)))
        );
      });
      sortedcolumnS.push(pyramid(sdscolumn));
    }
    sortedcolumnS.sort(function (a, b) {
      const parentA = allnodeS.get(a[0])!.parentID;
      const parentB = allnodeS.get(b[0])!.parentID;
      return (
        allcolumnS.get(column - 1)!.indexOf(parentA) -
        allcolumnS.get(column - 1)!.indexOf(parentB)
      );
    });
    nodeS = new Array();
    for (const scolumn of sortedcolumnS) {
      nodeS = nodeS.concat(scolumn);
    }
    allcolumnS.set(column, nodeS);
  }

  function collision(list: Array<string>, target: number): number {
    const node = allnodeS.get(list.pop()!)!;
    if (node.position[1] + node.dimensions.height <= target) {
      return target;
    }
    if (list.length === 0) {
      node.position[1] +=
        (node.position[1] + node.dimensions.height - target) / 2;
      return node.position[1] + node.dimensions.height;
    }
    node.position[1] = collision(
      list,
      node.position[1] - (node.position[1] + node.dimensions.height - target)
    );
    return node.position[1] + node.dimensions.height;
  }

  // assigning first position
  for (let column = 0; column < allcolumnS.size; column++) {
    // recursions are stupid, everything is out of order
    const nodeS = allcolumnS.get(column)!;
    if (column === 0) {
      continue;
    }
    let offset: number = 0;
    let previousparentID: string = "";
    for (let i = 0; i < nodeS.length; i++) {
      const node = allnodeS.get(nodeS[i])!;
      const parent = allnodeS.get(node.parentID)!;
      if (previousparentID != node.parentID) {
        offset = 0;
        previousparentID = node.parentID;
      }
      if (i == 0) {
        node.position[1] =
          parent.position[1] +
          parent.dimensions.height / 2 -
          parentsizeS.get(node.parentID)! / 2 -
          node.dimensions.height / 2 +
          offset;
        offset += node.dimensions.height;
        continue;
      }
      node.position[1] = collision(
        nodeS.slice(0, i),
        parent.position[1] +
          parent.dimensions.height / 2 -
          parentsizeS.get(node.parentID)! / 2 -
          node.dimensions.height / 2 +
          offset
      );
      offset += node.dimensions.height;
    }
  }

  let maxwidth: number = 0;
  // assign width
  for (const node of allnodeS.values()) {
    node.position[0] = node.column * 400 + 15;
    maxwidth = Math.max(maxwidth, node.position[0] + 400);
  }

  let minheight: number = 0;
  let maxheight: number = 0;
  // find bounds
  for (const node of allnodeS.values()) {
    minheight = Math.min(minheight, node.position[1] + 15);
    maxheight = Math.max(
      maxheight,
      node.position[1] + node.dimensions.height + 15
    );
  }

  // adjust
  for (const node of allnodeS.values()) {
    node.position[1] += Math.abs(minheight + 15);
  }
  maxheight += Math.abs(minheight);

  // output generation
  const output: Record<string, NodeBoxPosition> = {};
  for (const node of allnodeS.values()) {
    output[node.ID] = {
      offsetLeft: node.position[0],
      offsetTop: node.position[1],
      ...node.dimensions,
    };
  }
  return {
    canvasWidth: maxwidth + 15,
    canvasHeight: maxheight + 15,
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
