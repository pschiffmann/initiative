import {
  ExpressionJson,
  NodeData,
  SceneDocument,
} from "../scene-data/index.js";
import { ImportNames } from "./imports.js";

export function generateNodeRuntime(
  document: SceneDocument,
  importNames: ImportNames,
  nodeId: string
): string {
  const nodeData = document.getNode(nodeId);
  let result = "";

  // generateNodeAdapter
  result += "gNAd:\n";
  result +=
    generateNodeAdapter(
      nodeData,
      importNames.nodeComponents.get(nodeData.type)!
    ) + "\n";
  //

  // generateNodeOutputContexts
  if (Object.keys(nodeData.schema.outputTypes).length > 0) {
    result += "gNOC:\n";
    result += generateNodeOuptputContexts(nodeData) + "\n";
  }
  //

  // generateNodeOutputsProvider
  if (Object.keys(nodeData.schema.outputTypes).length > 0) {
    result += "gNOP:\n";
    result += generateNodeOutputsProvider(nodeData, nodeId) + "\n";
  }
  //

  // generateSlotComponent
  const slotsResultsMap: Map<string, null | string | Array<null | string>> =
    new Map();
  nodeData.forEachSlot((childId, slotName, index) => {
    // calls for node PageLayout:
    // call 1: childId == "PageTitle", slotName == "child", index == 0
    // call 2: childId == "NewArticleDialog", slotName == "child", index == 1
    // call 3: childId == "ArticlesTable", slotName == "child", index == 2
    if (index == undefined) {
      slotsResultsMap.set(slotName, childId);
    } else {
      if (!slotsResultsMap.has(slotName)) {
        slotsResultsMap.set(slotName, new Array());
      }
      const arraycheck = slotsResultsMap.get(slotName);
      if (!Array.isArray(arraycheck)) {
        throw new Error("No Array after Array allocation");
      }
      arraycheck.push(childId);
    }
  });
  for (const [slotname, data] of slotsResultsMap) {
    if (!Array.isArray(data)) {
      continue;
    }
    result += "gSCO:\n";
    result += generateSlotComponent(nodeId, slotname) + "\n";
  }
  //

  // test
  console.log(nodeData);
  //console.log(nodeData.inputs);
  // test

  return result;
}

function generateNodeAdapter(
  nodeData: NodeData,
  componentname: string
): string {
  let result: string = "";
  result += `function ${nodeData.id}_Adapter() { \n`;
  result += `return ( \n`;
  result += `<${componentname} \n`;

  // inputs
  const inputResultsMap: Map<string, string | Array<string>> = new Map();
  nodeData.forEachInput((expression, type, inputName, index) => {
    // calls for node PageLayout:
    // call 1: expression == { ... }, inputName == "flexDirection", index == undefined
    // call 2: expression == { ... }, inputName == "gap", index == undefined
    // call 3: expression == null, inputName == "alignSelf", index == 0
    // call 4: expression == { ... }, inputName == "alignSelf", index == 1
    // call 5: expression == null, inputName == "alignSelf", index == 2
    if (index == undefined) {
      if (expression == null) {
        inputResultsMap.set(inputName, "undefined");
      } else {
        inputResultsMap.set(inputName, provideValue(expression.json));
      }
    } else {
      if (!inputResultsMap.has(inputName)) {
        inputResultsMap.set(inputName, new Array());
      }
      const arraycheck = inputResultsMap.get(inputName);
      if (!Array.isArray(arraycheck)) {
        throw new Error("No Array after Array allocation");
      }
      if (expression == null) {
        arraycheck.push("undefined");
      } else {
        arraycheck.push(provideValue(expression.json));
      }
    }
  });
  for (const [input, data] of inputResultsMap) {
    result += `${input}={`;
    if (Array.isArray(data)) {
      result += `[`;
      for (const value of data) {
        result += `${value} ,`;
      }
      result = result.slice(0, result.length - 2);
      result += "]";
    } else {
      result += `${data}`;
    }
    result += `}\n`;
  }

  // slots
  const slotsResultsMap: Map<string, null | string | Array<null | string>> =
    new Map();
  nodeData.forEachSlot((childId, slotName, index) => {
    // calls for node PageLayout:
    // call 1: childId == "PageTitle", slotName == "child", index == 0
    // call 2: childId == "NewArticleDialog", slotName == "child", index == 1
    // call 3: childId == "ArticlesTable", slotName == "child", index == 2
    if (index == undefined) {
      slotsResultsMap.set(slotName, childId);
    } else {
      if (!slotsResultsMap.has(slotName)) {
        slotsResultsMap.set(slotName, new Array());
      }
      const arraycheck = slotsResultsMap.get(slotName);
      if (!Array.isArray(arraycheck)) {
        throw new Error("No Array after Array allocation");
      }
      arraycheck.push(childId);
    }
  });
  if (slotsResultsMap.size > 0) {
    result += `slots{{\n`;
    for (const [slotName, data] of slotsResultsMap) {
      result += `${slotName}: { `;
      if (!Array.isArray(data)) {
        result += `Component: ${data}_Adapter },\n`;
        continue;
      }
      result += `size: ${data.length}, Component: ${nodeData.id}_${slotName} },\n`;
    }
    result += `}}\n`;
  }

  const outputTypesKeyArray = Object.keys(nodeData.schema.outputTypes);
  if (outputTypesKeyArray.length > 0) {
    result += `OutputsProvider={${nodeData.id}_OutputsProvider}\n`;
  }
  //

  result += `/>\n);\n}\n`;
  return result;
}

function generateNodeOuptputContexts(nodeData: NodeData): string {
  let result: string = "";
  for (const output of Object.keys(nodeData.schema.outputTypes)) {
    result += `const ${nodeData.id}$${output}Context = createContext<any>(null);\n`;
  }
  return result;
}

function generateNodeOutputsProvider(
  nodeData: NodeData,
  nodeId: string
): string {
  let result: string = "";
  const list: Array<string> = new Array();
  result += `function ${nodeId}_OutputsProvider({\n`;
  for (const output of Object.keys(nodeData.schema.outputTypes)) {
    list.push(output);
    result += `${output},\n`;
  }
  result += `children,\n`;
  result += `}: any) {\n`;
  result += `return (\n`;
  result += recursiveDivInserter(nodeId, list.reverse(), "children");
  result += `);\n`;
  result += `}`;
  return result;
  function recursiveDivInserter(
    id: string,
    list: Array<string>,
    end: string
  ): string {
    const output = list.pop();
    if (output == undefined) return `{${end}}\n`;
    return `<${id}$${output}Context.Provider value={${output}}>\n${recursiveDivInserter(
      id,
      list,
      end
    )}</${id}$${output}Context.Provider>\n`;
  }
}

// TODO
function generateSlotComponent(
  nodeId: string,
  slotName: string,
  index?: number
): string {
  let result: string = ``;
  result += `function ${nodeId}_${slotName}({`;
  result += ` TODO `;
  result += `}: any) {\n`;
  result += `switch ( TODO ) {\n`;
  // TODO

  return result;
}

function provideValue(exjson: ExpressionJson): string {
  let result: string = "";
  let directName: string = "";
  switch (exjson.type) {
    case "string-literal":
    case "number-literal":
    case "boolean-literal":
      return JSON.stringify(exjson.value);
    case "library-member":
      directName = exjson.libraryName.slice(
        exjson.libraryName.indexOf("::") + 2
      );
      return `${directName}Library$${exjson.memberName}`;
    case "node-output":
      return `usecontext(${exjson.nodeId}$${exjson.outputName}Context)`;
    case "function-call":
      const args = exjson.args[0];
      const fn = exjson.fn;
      if (args == null)
        throw new Error("function-call unexpected null in args");
      if (args.type != "node-output")
        throw new Error("function-call unexpected type in args");
      if (fn.type != "library-member")
        throw new Error("function-call unexpected type in fn");
      directName = fn.libraryName.slice(fn.libraryName.indexOf("::") + 2);
      return `${directName}Library$${fn.memberName}(useContext(${args.nodeId}$${args.outputName}Context))`;
    case "entity-literal":
    case "scene-input":
    default:
      // NOT IMPLEMENTED
      throw new Error("provideValue unimplemented json.type");
  }
}
