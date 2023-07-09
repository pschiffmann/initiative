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
  result +=
    generateNodeAdapter(
      nodeData,
      importNames.nodeComponents.get(nodeData.type)!,
      importNames
    ) + "\n";
  //

  // generateNodeOutputContexts
  if (Object.keys(nodeData.schema.outputTypes).length > 0) {
    result += generateNodeOuptputContexts(nodeData) + "\n";
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
    result += generateSlotComponent(nodeData, slotname, data) + "\n";
  }
  //

  // generateNodeOutputsProvider
  let check = true;
  for (const value of slotsResultsMap.values()) {
    if (Array.isArray(value)) {
      check = false;
      break;
    }
  }
  if (Object.keys(nodeData.schema.outputTypes).length > 0 && check) {
    result += `${generateNodeOutputsProvider(nodeData)}\n`;
  }
  //

  // test
  // console.log(nodeData);
  // console.log(importNames);
  // test

  return result;
}

function generateNodeAdapter(
  nodeData: NodeData,
  componentname: string,
  importNames: ImportNames
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
        inputResultsMap.set(
          inputName,
          provideValue(expression.json, importNames, nodeData)
        );
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
        arraycheck.push(provideValue(expression.json, importNames, nodeData));
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
    result += `slots={{\n`;
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

  let check = true;
  for (const value of slotsResultsMap.values()) {
    if (Array.isArray(value)) {
      check = false;
      break;
    }
  }
  const outputTypesKeyArray = Object.keys(nodeData.schema.outputTypes);
  if (outputTypesKeyArray.length > 0 && check) {
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

function generateNodeOutputsProvider(nodeData: NodeData): string {
  let result: string = "";
  const list: Array<string> = new Array();
  result += `function ${nodeData.id}_OutputsProvider({\n`;
  for (const output of Object.keys(nodeData.schema.outputTypes)) {
    list.push(output);
    result += `${output},\n`;
  }
  result += `children,\n`;
  result += `}: any) {\n`;
  result += `return (\n`;
  result += recursiveDivInserter(nodeData.id, list.reverse(), "{children}");
  result += `)\n`;
  result += `}`;
  return result;
}

function generateSlotComponent(
  nodeData: NodeData,
  slotName: string,
  children: Array<string | null>
): string {
  let result: string = ``;
  result += `function ${nodeData.id}_${slotName}({ `;
  const list: Array<string> = new Array();
  if (Object.keys(nodeData.schema.outputTypes).length > 0) {
    for (const prop of Object.keys(nodeData.schema.outputTypes)) {
      list.push(prop);
      result += `${prop}, `;
    }
    list.reverse();
  }
  result += `index `;
  result += `}: any) {\n`;
  result += `switch (index) {\n`;
  for (let index = 0; index < children.length; index++) {
    result += `case ${index}:\n`;
    result += `return (\n`;
    if (Object.keys(nodeData.schema.outputTypes).length <= 0) {
      result += `<${children[index]}_Adapter />`;
    } else {
      result += `${recursiveDivInserter(
        nodeData.id,
        list.slice(),
        `<${children[index]}_Adapter />`
      )}`;
    }
    result += `);\n`;
  }
  result += `default:\n`;
  result += `throw new Error(\`Invalid index '\${index}'.\`)\n`;
  result += `}\n`;
  result += `}`;
  return result;
}

function recursiveDivInserter(
  id: string,
  list: Array<string>,
  end: string
): string {
  const output = list.pop();
  if (output == undefined) return `${end}\n`;
  return `<${id}$${output}Context.Provider value={${output}}>\n${recursiveDivInserter(
    id,
    list,
    end
  )}</${id}$${output}Context.Provider>\n`;
}

function provideValue(
  exjson: ExpressionJson,
  importNames: ImportNames,
  nodeData: NodeData
): string {
  let result: string = "";
  let directName: string | undefined = "";
  switch (exjson.type) {
    case "string-literal":
    case "number-literal":
    case "boolean-literal":
      return JSON.stringify(exjson.value);
    case "library-member":
      directName = importNames.libraryMembers.get(
        `${exjson.libraryName}::${exjson.memberName}`
      );
      if (directName == undefined) throw new Error(`undefined library-member`);
      return `${directName}`;
    case "node-output":
      return `useContext(${exjson.nodeId}$${exjson.outputName}Context)`;
    case "function-call":
      const fn = exjson.fn;
      const args = exjson.args;
      if (fn.type != "library-member") {
        throw new Error("function-call unexpected type in fn");
      }
      directName = importNames.libraryMembers.get(
        `${fn.libraryName}::${fn.memberName}`
      );
      if (directName == undefined) {
        directName = importNames.nodeComponents.get(nodeData.type);
      }
      if (directName == undefined) throw new Error("undefined library-member");
      let result: string = "";
      result += `${directName}(`;
      if (args.length <= 0) throw new Error("no args in  function-call");
      for (const value of args) {
        if (value == null) {
          result += `null, `;
          continue;
        }
        result += `${provideValue(value, importNames, nodeData)}, `;
      }
      result = result.slice(0, result.length - 2);
      result += `)`;
      return result;
    case "entity-literal":
    case "scene-input":
    default:
      // NOT IMPLEMENTED
      throw new Error("provideValue unimplemented json.type");
  }
}
