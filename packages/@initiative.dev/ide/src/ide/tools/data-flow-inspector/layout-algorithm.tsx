import {
  ComponentNodeData,
  Expression,
  MemberAccessExpression,
  SceneDocument,
} from "#shared";
import { NodeSchema } from "@initiative.dev/schema";

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
   * tunnel positions in px filed under destination id.
   */
  readonly tunnels: Record<
    string,
    [entranceX: number, entranceY: number, exitX: number, exitY: number]
  >;

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
  readonly innerD: Pick<
    NodeBoxPosition,
    "height" | "inputOffsets" | "outputOffsets"
  >;
  readonly chain: [length: number, size: number];
  position: [xCoordinate: number, yCoordinate: number];
  readonly inputs: Array<string>;
}

function calculateLayout(document: SceneDocument): Layout {
  const nodesseperation: number = 16;
  const tunnelspacing: number = 8;
  const maxangle: number = 60;

  // todo change into a 2d model
  let minimumtunnelseperation: number = Number.NEGATIVE_INFINITY;
  const minimumtunnelseperation2d: Map<number, number> = new Map();

  const allNodes: Map<string, box> = new Map();

  if (document.getRootNodeId() === null)
    return { canvasWidth: 0, canvasHeight: 0, nodeBoxPositions: {} };
  unzip(document.getRootNodeId()!, "", 0);

  /**
   * Will unpack all nodes from the Scenedocument into allNodes Map.
   * Recursive!
   * @param nodeID Unique node name
   * @param nodeparent Node Id of parent node to establish parent child connections
   * @param column depth level of the node in the scene document ancestry
   * @returns chain length value needed to sort nodes
   */
  function unzip(nodeID: string, nodeparent: string, column: number): number {
    const data = document.getNode(nodeID)!;
    if (!(data instanceof ComponentNodeData)) return 1;
    const schema: NodeSchema = data.schema;
    const childIDs = Object.values(data!.slots);
    const chainraw: [number, number] = [0, childIDs.length];
    if (chainraw[1] > 0) {
      for (const child of childIDs) {
        chainraw[0] += unzip(child, nodeID, column + 1);
      }
    }
    const dimensions = calculateInnerDimensions(data);
    const inputs: Array<string> = new Array();
    let inputsraw = new Array();
    data.forEachInput((expression) =>
      expression !== null
        ? inputsraw.push(...expressionEvaluation(expression))
        : null,
    );
    inputsraw.forEach((value) => inputs.push(value[0]));
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
    if (node.column == 0) return chainraw[0] + 1;

    minimumtunnelseperation = Math.max(minimumtunnelseperation, node.size);
    if (!minimumtunnelseperation2d.has(node.column)) {
      minimumtunnelseperation2d.set(column, 0);
    }
    minimumtunnelseperation2d.set(
      column,
      Math.max(minimumtunnelseperation2d.get(column)!, node.size),
    );
    return chainraw[0] + 1;
  }

  // todo get rid of allColumns
  const allColumns: Map<number, Set<string>> = new Map();
  for (const node of allNodes.values()) {
    if (!allColumns.has(node.column)) allColumns.set(node.column, new Set());
    allColumns.get(node.column)!.add(node.id);
  }

  const allConnectionsFrom: Map<string, Set<string>> = new Map();
  const allConnectionsTo: Map<string, Set<string>> = new Map();
  for (const node of allNodes.values()) {
    for (const connection of node.inputs) {
      const fromnode = allNodes.get(connection)!;
      if (node.column - fromnode.column <= 1) continue;
      if (!allConnectionsFrom.has(fromnode.id)) {
        allConnectionsFrom.set(fromnode.id, new Set());
      }
      if (!allConnectionsTo.has(node.id)) {
        allConnectionsTo.set(node.id, new Set());
      }
      allConnectionsFrom.get(fromnode.id)!.add(node.id);
      allConnectionsTo.get(node.id)!.add(fromnode.id);
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
    // root node skip
    if (depth === 0) {
      for (const nodeId of allColumns.get(depth)!.values()) {
        geographyFirstSort.get(depth)!.push(nodeId);
      }
      continue;
    }
    const columnNodes: Map<string, Array<string>> = new Map();
    // sorting into parent groups
    for (const nodeId of allColumns.get(depth)!.values()) {
      const node = allNodes.get(nodeId)!;
      if (!columnNodes.has(node.parent))
        columnNodes.set(node.parent, new Array());
      columnNodes.get(node.parent)!.push(node.id);
    }
    // sorting individual nodes
    for (const [parent, group] of columnNodes) {
      let unsortedList: Array<[string, number, number]> = new Array();
      for (const nodeId of group) {
        const node = allNodes.get(nodeId)!;
        unsortedList.push([node.id, node.chain[0], node.chain[1]]);
      }
      unsortedList.sort(function (b, a) {
        return a[1] * 100 + a[2] - (b[1] * 100 + b[2]);
      });
      let sortedList: Array<string> = new Array();
      unsortedList.forEach(function (a) {
        sortedList.push(a[0]);
      });
      sortedList = pyramid(sortedList);
      columnNodes.set(parent, sortedList);
    }
    // sorting parent groups
    const unsortedparentlist: Array<[string, Array<string>]> = new Array();
    for (const [parent, group] of columnNodes) {
      unsortedparentlist.push([parent, group]);
    }
    unsortedparentlist.sort(function (a, b) {
      const parentA: number = geographyFirstSort.get(depth - 1)!.indexOf(a[0]);
      const parentB: number = geographyFirstSort.get(depth - 1)!.indexOf(b[0]);
      return parentA - parentB;
    });
    const sortedparentlist: Array<string> = new Array();
    unsortedparentlist.forEach(function (group) {
      group[1].forEach(function (node) {
        sortedparentlist.push(node);
      });
    });
    geographyFirstSort.set(depth, sortedparentlist);
  }

  /**
   * function to quickly find the combined size of nodes belonging to a single parent
   * @param nodes nodes to be measured
   * @param parent filter of what nodes to include
   * @returns measured size, nodes that match filter, rest of nodes
   */
  function combinedNodeSize(
    nodes: Array<string>,
    parent: string,
  ): [size: number, found: Array<string>, rest: Array<string>] {
    let size: number = 0;
    let index: number;
    for (index = 0; index < nodes.length; index++) {
      const node = allNodes.get(nodes[index])!;
      if (node.parent !== parent) break;
      size += node.size + nodesseperation;
    }
    const found: Array<string> = nodes.slice(0, index);
    const rest: Array<string> = nodes.slice(index);
    return [size, found, rest];
  }

  /**
   * used for a simple first pass placement of nodes
   * @param nodes all nodes to be placed
   * @param yCoordinate highest coordinate to start placing
   */
  function assignFirstPosition(nodes: Array<string>, yCoordinate: number) {
    for (const id of nodes) {
      const node = allNodes.get(id)!;
      node.position[1] = yCoordinate;
      yCoordinate += node.size + nodesseperation;
    }
  }
  // establishing initial node position
  // needed to find optimal tunnel placements
  for (let depth = 0; depth <= maxdepth; depth++) {
    if (depth == 0) continue;
    let workorder: Array<string> = geographyFirstSort.get(depth)!;
    do {
      const parent: box = allNodes.get(allNodes.get(workorder[0])!.parent)!;
      let yCoordinatestart: number;
      let batch: Array<string>;
      [yCoordinatestart, batch, workorder] = combinedNodeSize(
        workorder,
        parent.id,
      );
      assignFirstPosition(
        batch,
        parent.position[1] + parent.size / 2 - yCoordinatestart / 2,
      );
    } while (workorder.length > 0);
    let adjust = geographyFirstSort.get(depth)!;
    for (const id of adjust) {
      resolveCollision(adjust.slice(0, adjust.indexOf(id)), id, true);
    }
  }

  // collision resolve
  function resolveCollision(
    list: Array<string>,
    id: string,
    compromise: boolean,
  ) {
    const node = allNodes.get(id)!;
    if (list.length == 0) return;
    const nextnode = allNodes.get(list.pop()!)!;
    if (
      nextnode.position[1] + nextnode.size + nodesseperation <=
      node.position[1]
    )
      return;
    let conflictzone: number =
      nextnode.position[1] + nextnode.size + nodesseperation - node.position[1];
    conflictzone = Math.abs(conflictzone);
    if (compromise) {
      nextnode.position[1] -= conflictzone / 2;
      node.position[1] += conflictzone / 2;
    } else {
      nextnode.position[1] -= conflictzone;
    }
    compromise = false;
    resolveCollision(list, nextnode.id, compromise);
  }

  // tunnel find
  /**
   * Map< fromid, Map< toid, position >>
   */
  const metro: Map<string, Map<string, number>> = new Map();
  // middle
  for (const [originid, list] of allConnectionsFrom) {
    const origin = allNodes.get(originid)!;
    let placement: number = 0;
    for (const id of list) {
      const node = allNodes.get(id)!;
      placement += node.position[1] + node.size / 2;
    }
    placement = placement / list.size;
    if (!metro.has(origin.id)) metro.set(origin.id, new Map());
    for (const id of list) {
      metro.get(origin.id)!.set(id, placement);
    }
  }

  // group very close tunnels
  // todo make sure for any column a node can fit inbetween tunnels
  // todo change so only tunnels that actually run through the same columns get grouped
  const groupinglist: Array<
    [fromid: string, toid: Array<string>, position: Array<number>]
  > = new Array();
  for (const [fromid, data] of metro) {
    const templisttoid: Array<string> = new Array();
    const templistposition: Array<number> = new Array();
    for (const [toid, position] of data) {
      templisttoid.push(toid);
      templistposition.push(position);
    }
    groupinglist.push([fromid, templisttoid, templistposition]);
  }
  groupinglist.sort(function (a, b) {
    return a[2][0] - b[2][0];
  });

  for (const [index, data] of groupinglist.entries()) {
    const targets = redrill(
      index,
      data[2][0] - minimumtunnelseperation,
      new Array(),
    );
    if (targets.length <= 0) continue;
    let adjust = 0;
    targets.forEach(function (a) {
      adjust += groupinglist[index][2][0];
    });
    adjust = adjust / targets.length;
    adjust += (targets.length / 2) * tunnelspacing;
    for (const i of targets) {
      for (const [indexg, g] of groupinglist[i][2].entries()) {
        groupinglist[i][2][indexg] = adjust;
      }
      adjust -= tunnelspacing;
    }
  }
  for (const data of groupinglist) {
    const change = metro.get(data[0])!;
    for (const [index, id] of data[1].entries()) {
      change.set(id, data[2][index]);
    }
  }
  function redrill(
    index: number,
    bound: number,
    targets: Array<number>,
  ): Array<number> {
    if (index >= groupinglist.length) return targets;
    const data = groupinglist[index];
    if (data[2][0] >= bound) return targets;
    // exclude non touching tunnels
    targets.push(index);
    let calculate: number = 0;
    for (const i of targets) {
      calculate += groupinglist[i][2][0];
    }
    calculate = calculate / targets.length;
    calculate -= (targets.length * (tunnelspacing * 2)) / 2;
    calculate -= minimumtunnelseperation;
    return redrill(index + 1, calculate, targets);
  }

  // move nodes to clear metro lines
  // step 1
  // create 2d map of tunnels
  const tunnelmap2d: Map<number, Set<number>> = new Map();
  for (const [fromid, toidlist, positionlist] of groupinglist) {
    const from: number = allNodes.get(fromid)!.column;
    for (const [index, toid] of toidlist.entries()) {
      const to: number = allNodes.get(toid)!.column;
      for (let column = from + 1; column < to; column++) {
        if (!tunnelmap2d.has(column)) tunnelmap2d.set(column, new Set());
        tunnelmap2d.get(column)!.add(positionlist[index]);
      }
    }
  }
  // step 2
  // check each node for collision
  // find a tunnel, check for collision, move nodes out of the way
  for (const [column, tunnels] of tunnelmap2d) {
    const donetunnels: Array<number> = new Array();
    const nodesabove: Array<string> = new Array();
    const nodesbelow: Array<string> = geographyFirstSort.get(column)!;
    for (const tunnel of tunnels) {
      subwaydowndodge(donetunnels, tunnel, nodesabove, nodesbelow);
      donetunnels.push(tunnel);
    }
  }
  function subwaydowndodge(
    donetunnels: Array<number>,
    tunnel: number,
    nodesabove: Array<string>,
    nodesbelow: Array<string>,
  ) {
    if (nodesbelow.length <= 0) return; // finished checking nodes
    const node = allNodes.get(nodesbelow[0])!;
    if (node.position[1] > tunnel + tunnelspacing) {
      // tunnel is above node
      // go to next tunnel
      return;
    }
    if (node.position[1] + node.size < tunnel - tunnelspacing) {
      // tunnel is below node
      // go to next node
      nodesabove.push(nodesbelow[0]);
      subwaydowndodge(donetunnels, tunnel, nodesabove, nodesbelow.slice(1));
      return;
    }
    // tunnel hits node
    // resolve collision
    if (
      tunnel - tunnelspacing - node.position[1] <=
      node.position[1] + node.size - tunnel - tunnelspacing
    ) {
      // node is shifted down
      nodesmover(nodesbelow, tunnel + tunnelspacing - node.position[1]);
      return;
    }
    //remove
    /*
    // testing reroute
    nodesmover(nodesbelow, tunnel + tunnelspacing - node.position[1]);
    return;
    */
    //remove

    // node is shifted up
    nodesabove.push(nodesbelow[0]);
    nodesabove.reverse();
    nodesmover(
      nodesabove,
      tunnel - tunnelspacing - (node.position[1] + node.size),
    );
    nodesabove.reverse();
    subwayupdodge(donetunnels, nodesabove);
  }
  // todo merge with subwaydowndodge
  function subwayupdodge(tunnels: Array<number>, nodesabove: Array<string>) {
    if (tunnels.length <= 0) return;
    if (nodesabove.length <= 0) return;
    const node = allNodes.get(nodesabove[nodesabove.length - 1])!;
    const tunnel = tunnels[tunnels.length - 1];
    if (tunnel + tunnelspacing <= node.position[1]) {
      // node is below tunnel
      // check next node
      nodesabove.pop();
      subwayupdodge(tunnels, nodesabove);
      return;
    }
    if (tunnel - tunnelspacing > node.position[1] + node.size) {
      // node is above tunnel
      // check next tunnel
      tunnels.pop();
      subwayupdodge(tunnels, nodesabove);
      return;
    }
    // tunnel intersects node
    // move all nodes up
    let move = tunnel - tunnelspacing - (node.position[1] + node.size);
    nodesabove.reverse();
    nodesmover(
      nodesabove,
      tunnel - tunnelspacing - (node.position[1] + node.size),
    );
    nodesabove.reverse();
    tunnels.pop();
    subwayupdodge(tunnels, nodesabove);
  }
  function nodesmover(nodes: Array<string>, move: number) {
    for (let index = 0; index < nodes.length; index++) {
      const node = allNodes.get(nodes[index])!;
      node.position[1] += move;
      if (index == nodes.length - 1) continue;
      if (move == 0) break;
      if (move > 0) {
        move = Math.min(
          move,
          node.position[1] +
            node.size +
            nodesseperation -
            allNodes.get(nodes[index + 1])!.position[1],
        );
        if (move <= 0) break;
      } else if (move < 0) {
        const nextnode = allNodes.get(nodes[index + 1])!;
        move = Math.max(
          move,
          node.position[1] -
            nodesseperation -
            (nextnode.position[1] + nextnode.size),
        );
        if (move >= 0) break;
      }
    }
  }

  // metro reverse
  /**
   * Map< toid, Map< fromid, position >>
   */
  const reversemetro: Map<string, Map<string, number>> = new Map();
  for (const [fromid, data] of metro) {
    for (const [toid, position] of data) {
      if (!reversemetro.has(toid)) reversemetro.set(toid, new Map());
      reversemetro.get(toid)!.set(fromid, position);
    }
  }

  // yCoordinate fix
  let minheight: number = Number.POSITIVE_INFINITY;
  let maxheight: number = Number.NEGATIVE_INFINITY;
  for (const node of allNodes.values()) {
    minheight = Math.min(minheight, node.position[1]);
    maxheight = Math.max(maxheight, node.position[1] + node.size);
  }
  maxheight += Math.abs(minheight);
  for (const node of allNodes.values()) {
    node.position[1] += Math.abs(minheight);
  }

  // xCoordinate assignment
  let seperation = 320;
  for (let depth = 0; depth < allColumns.size; depth++) {
    const data = allColumns.get(depth)!;
    if (depth == 0) continue;
    // maybe also space out outgoing tunnels
    let highestSeperation: number = 80;
    for (const id of data) {
      const inputnode = allNodes.get(id)!;
      for (const outputnodeid of inputnode.inputs) {
        const outputnode = allNodes.get(outputnodeid)!;
        if (inputnode.column - outputnode.column > 1) {
          highestSeperation = Math.max(
            highestSeperation,
            blackmagic(
              inputnode,
              metro.get(outputnode.id)!.get(inputnode.id)! +
                Math.abs(minheight),
              0,
            ),
          );
        } else {
          highestSeperation = Math.max(
            highestSeperation,
            blackmagic(inputnode, outputnode.position[1], outputnode.size),
          );
        }
      }
    }
    for (const id of data) {
      allNodes.get(id)!.position[0] = seperation + highestSeperation;
    }
    seperation += highestSeperation + 320;
  }

  /**
   * Just some math.
   *
   * b = sqrt(sin(alpha.rad)² - a²)
   *
   * alpha = maxangle
   *
   * a = seperation in yCoordinates between nodes
   * @param inputnode
   * @param outputposition in px
   * @param outputsize 0 if tunnel
   * @returns b
   */
  function blackmagic(
    inputnode: box,
    outputposition: number,
    outputsize: number,
  ): number {
    return Math.sqrt(
      Math.abs(
        Math.pow(Math.sin(maxangle * (Math.PI / 180)), 2) -
          Math.pow(
            Math.abs(
              inputnode.position[1] +
                inputnode.size / 2 -
                (outputposition + outputsize / 2),
            ),
            2,
          ),
      ),
    );
  }

  // find maxwidth
  let maxwidth = 0;
  for (const node of allNodes.values()) {
    maxwidth = Math.max(maxwidth, node.position[0] + 320);
  }

  // output
  const output: Record<string, NodeBoxPosition> = {};
  for (const node of allNodes.values()) {
    let tunnelmap: NodeBoxPosition["tunnels"] = {};
    if (reversemetro.has(node.id)) {
      const tunnelmapraw = reversemetro.get(node.id)!;
      for (const [id, yCoordinate] of tunnelmapraw) {
        //
        tunnelmap[id] = [
          allNodes.get(
            allColumns
              .get(allNodes.get(id)!.column + 1)!
              .values()
              .next().value,
          )!.position[0] - 20,
          yCoordinate + Math.abs(minheight),
          allNodes.get(node.parent)!.position[0] + 340,
          yCoordinate + Math.abs(minheight),
        ];
        //
      }
    }
    output[node.id] = {
      offsetLeft: node.position[0],
      offsetTop: node.position[1],
      tunnels: tunnelmap,
      ...node.innerD,
    };
  }
  return {
    canvasWidth: maxwidth + nodeBoxSizes.canvasOffset,
    canvasHeight: maxheight + nodeBoxSizes.canvasOffset,
    nodeBoxPositions: output,
  };
}

function calculateInnerDimensions(
  data: ComponentNodeData,
): Pick<NodeBoxPosition, "height" | "inputOffsets" | "outputOffsets"> {
  const inputOffsets: Record<string, number> = {};
  const outputOffsets: Record<string, number> = {};

  let boxHeight =
    nodeBoxSizes.padding + // Top padding
    nodeBoxSizes.header; // Header

  data.forEachInput((expression, attributes, inputName, index) => {
    const inputKey = index === undefined ? inputName : `${inputName}::${index}`;
    inputOffsets[inputKey] =
      boxHeight +
      Object.keys(inputOffsets).length * nodeBoxSizes.ioRow +
      nodeBoxSizes.connectorOffsetY;
  });
  data.schema.forEachOutput((outputName) => {
    outputOffsets[outputName] =
      boxHeight +
      Object.keys(outputOffsets).length * nodeBoxSizes.ioRow +
      nodeBoxSizes.connectorOffsetY;
  });

  return {
    height:
      boxHeight +
      Math.max(
        Object.keys(inputOffsets).length,
        Object.keys(outputOffsets).length,
      ) *
        nodeBoxSizes.ioRow +
      nodeBoxSizes.padding,
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
   * Each input/output has a height of 48px. The center of the connector has a
   * vertical offset of 24px, and a horizontal offset of 4px from the NodeBox
   * edge.
   */
  ioRow: 24,

  connectorOffsetX: 0,
  connectorOffsetY: 12,
};

/**
 * Returns all node outputs inside `expression` as `[nodeId, outputName]`
 * tuples.
 */
export function expressionEvaluation(
  expression: Expression,
): [nodeId: string, outputName: string][] {
  const output = new Array<[nodeId: string, outputName: string]>();
  if (expression instanceof MemberAccessExpression) {
    if (expression.head.type === "node-output") {
      output.push([expression.head.nodeId, expression.head.outputName]);
    }
    output.push(
      ...expression.args.flatMap((arg) =>
        arg ? expressionEvaluation(arg) : [],
      ),
    );
  }
  return output;
}
