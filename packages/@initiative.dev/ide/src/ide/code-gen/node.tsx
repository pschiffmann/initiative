import {
  EnumValueExpression,
  Expression,
  FluentMessageExpression,
  JsonLiteralExpression,
  MemberAccessExpression,
  NodeData,
  SceneDocument,
} from "#shared";
import { NodeDefinition } from "@initiative.dev/schema";
import { dedent } from "@pschiffmann/std/dedent";
import {
  generateContextProviderJsx,
  getNodeOutputContextName,
  getSceneInputContextName,
} from "./context.js";
import { NameResolver } from "./name-resolver.js";

export function generateNodeRuntime(
  document: SceneDocument,
  nameResolver: NameResolver,
  nodeId: string,
): string {
  const nodeData = document.getNode(nodeId);
  const definition = document.definitions.getNode(nodeData.type);

  let result = "";

  if (nodeData.errors) {
    // TODO: Generate Error component
    const ReactElement = nameResolver.importType({
      moduleName: "react",
      exportName: "ReactElement",
    });
    result += `function ${nodeData.id}_Adapter(): ${ReactElement} {\n`;
    result += `throw new Error("Node: ${nodeData.id} contains errors!");\n`;
    result += `}\n`;
    return result;
  }

  // generateNodeAdapter
  result += generateNodeAdapter(nodeData, definition, nameResolver) + "\n";
  //

  // generateNodeOutputContexts
  if (Object.keys(nodeData.schema.outputAttributes).length > 0) {
    result +=
      generateNodeOuptputContexts(nodeData, definition, nameResolver) + "\n";
  }
  //

  // generateSlotComponent
  const slotsResultsMap: Map<string, string | Array<string | null>> = new Map();
  nodeData.forEachSlot((childId, slotName, index) => {
    // calls for node PageLayout:
    // call 1: childId == "PageTitle", slotName == "child", index == 0
    // call 2: childId == "NewArticleDialog", slotName == "child", index == 1
    // call 3: childId == "ArticlesTable", slotName == "child", index == 2
    if (index === undefined) {
      slotsResultsMap.set(slotName, childId!);
    } else {
      let arraycheck = slotsResultsMap.get(slotName);
      if (!Array.isArray(arraycheck)) {
        slotsResultsMap.set(slotName, (arraycheck = new Array()));
      }
      // TODO
      arraycheck.push(childId);
    }
  });
  for (const [slotname, data] of slotsResultsMap) {
    if (!Array.isArray(data)) {
      continue;
    }
    result +=
      generateSlotComponent(
        nodeData,
        definition,
        slotname,
        data,
        nameResolver,
      ) + "\n";
  }
  //

  // generateNodeOutputsProvider
  if (nodeData.schema.hasRegularOutputs()) {
    result += `${generateNodeOutputsProvider(
      nodeData,
      definition,
      nameResolver,
    )}\n`;
  }

  return result;
}

function generateNodeAdapter(
  nodeData: NodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  const componentName = nameResolver.importBinding(definition);
  let result: string = "";
  result += `function ${nodeData.id}_Adapter() { \n`;
  result += `return ( \n`;
  result += `<${componentName} \n`;

  // inputs
  const inputResultsMap: Map<string, string | Array<string>> = new Map();
  nodeData.forEachInput((expression, attributes, inputName, index) => {
    // calls for node PageLayout:
    // call 1: expression == { ... }, inputName == "flexDirection", index == undefined
    // call 2: expression == { ... }, inputName == "gap", index == undefined
    // call 3: expression == null, inputName == "alignSelf", index == 0
    // call 4: expression == { ... }, inputName == "alignSelf", index == 1
    // call 5: expression == null, inputName == "alignSelf", index == 2
    if (index === undefined) {
      if (expression === null) {
        inputResultsMap.set(inputName, "undefined");
      } else {
        inputResultsMap.set(
          inputName,
          provideValue(nodeData.id, inputName, expression, nameResolver),
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
      if (expression === null) {
        arraycheck.push("undefined");
      } else {
        arraycheck.push(
          provideValue(
            nodeData.id,
            `${inputName}-${index}`,
            expression,
            nameResolver,
          ),
        );
      }
    }
  });
  for (const [input, data] of inputResultsMap) {
    result += `${input}={`;
    if (Array.isArray(data)) {
      result += `[${data.join(", ")}]`;
    } else {
      result += `${data}`;
    }
    result += `}\n`;
  }

  // slots
  const slotsResultsMap: Map<string, string | Array<string | null>> = new Map();
  nodeData.forEachSlot((childId, slotName, index) => {
    // calls for node PageLayout:
    // call 1: childId == "PageTitle", slotName == "child", index == 0
    // call 2: childId == "NewArticleDialog", slotName == "child", index == 1
    // call 3: childId == "ArticlesTable", slotName == "child", index == 2
    if (index === undefined) {
      slotsResultsMap.set(slotName, childId!);
    } else {
      if (!slotsResultsMap.has(slotName)) {
        slotsResultsMap.set(slotName, new Array());
      }
      const arraycheck = slotsResultsMap.get(slotName);
      if (!Array.isArray(arraycheck)) {
        throw new Error("No Array after Array allocation");
      }
      arraycheck.push(childId);
      // TODO done?
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
      if (data[0] !== null) {
        result += `size: ${data.length}, Component: ${nodeData.id}_${slotName} },\n`;
      } else {
        result += `size: 0, Component: ${nodeData.id}_${slotName} }, \n`;
      }
    }
    result += `}}\n`;
  }

  if (nodeData.schema.hasRegularOutputs()) {
    result += `OutputsProvider={${nodeData.id}_OutputsProvider}\n`;
  }
  //

  result += `/>\n);\n}\n`;
  return result;
}

function generateNodeOuptputContexts(
  nodeData: NodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  let result: string = "";
  const createContext = nameResolver.importBinding({
    moduleName: "react",
    exportName: "createContext",
  });
  const schemaName = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const outputTypes = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "OutputTypes",
  });
  for (const output of Object.keys(nodeData.schema.outputAttributes)) {
    const contextName = getNodeOutputContextName(nodeData.id, output);
    result += `const ${contextName} = ${createContext}<`;
    result += `${outputTypes}<${schemaName}>["${output}"]>(null!);\n`;
  }
  return result;
}

function generateNodeOutputsProvider(
  nodeData: NodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  let result: string = "";
  const outputNames = Object.keys(nodeData.schema.outputAttributes);
  result += `function ${nodeData.id}_OutputsProvider({\n`;
  for (const output of outputNames) {
    result += `${output},\n`;
  }
  result += `children,\n`;
  // TODO
  const schemaName = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const outputsProviderProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "OutputsProviderProps",
  });
  result += `}: ${outputsProviderProps}<${schemaName}>`;
  result += `) {\n`;
  result += `return (\n`;
  result += generateContextProviderJsx(
    nameResolver,
    nodeData.id,
    outputNames,
    "{children}",
  );
  result += `)\n`;
  result += `}`;
  return result;
}

function generateSlotComponent(
  nodeData: NodeData,
  definition: NodeDefinition,
  slotName: string,
  children: Array<string | null>,
  nameResolver: NameResolver,
): string {
  const schemaName = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const slotComponentProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "SlotComponentProps",
  });
  let result: string = ``;
  result += `function ${nodeData.id}_${slotName}({ `;
  const list: Array<string> = Object.keys(nodeData.schema.outputAttributes);
  for (const prop of list) {
    result += `${prop}, `;
  }
  // TODO done?
  result += `index `;
  result += `}: ${slotComponentProps}<${schemaName}, "${slotName}">) {\n`;
  result += `switch (index) {\n`;
  if (children[0] !== null) {
    for (let index = 0; index < children.length; index++) {
      result += `case ${index}:\n`;
      result += `return (\n`;
      result += `${generateContextProviderJsx(
        nameResolver,
        nodeData.id,
        list,
        `<${children[index]}_Adapter />`,
      )}`;
      result += `);\n`;
    }
  }
  result += `default:\n`;
  result += `throw new Error(\`Invalid index '\${index}'.\`)\n`;
  result += `}\n`;
  result += `}`;
  return result;
}

function provideValue(
  nodeId: string,
  fluentExpressionKey: string,
  expression: Expression,
  nameResolver: NameResolver,
): string {
  if (
    expression instanceof JsonLiteralExpression ||
    expression instanceof EnumValueExpression
  ) {
    return JSON.stringify(expression.value);
  }
  if (expression instanceof FluentMessageExpression) {
    const useContext = nameResolver.importBinding({
      moduleName: "react",
      exportName: "useContext",
    });
    const translateMessage = nameResolver.declareName("translateMessage");
    const FluentBundleContext = nameResolver.declareName("FluentBundleContext");
    return dedent`
      ${translateMessage}(
        ${useContext}(${FluentBundleContext}),
        "${nodeId}",
        "${fluentExpressionKey}",
        {
          ${Object.entries(expression.args)
            .map(([argName, expr]) => {
              const value = provideValue(
                nodeId,
                `${fluentExpressionKey}-${argName}`,
                expr!,
                nameResolver,
              );
              return `${JSON.stringify(argName)}: ${value},`;
            })
            .join("\n")}
        }
      )
      `;
  }
  if (expression instanceof MemberAccessExpression) {
    const useContext = nameResolver.importBinding({
      moduleName: "react",
      exportName: "useContext",
    });
    let head: string;
    switch (expression.head.type) {
      case "scene-input": {
        const contextName = getSceneInputContextName(expression.head.inputName);
        head = `${useContext}(${contextName})`;
        break;
      }
      case "node-output": {
        const contextName = getNodeOutputContextName(
          expression.head.nodeId,
          expression.head.outputName,
        );
        head = `${useContext}(${contextName})`;
        break;
      }
      case "debug-value":
        throw new Error("Unreachable");
    }

    let i = 0;
    return expression.selectors.reduce((target, selector) => {
      if (selector.type === "property") {
        return `${target}.${selector.propertyName}`;
      }

      const args = expression.args
        .slice(i, (i += selector.memberType.parameters.length))
        .map((arg) =>
          arg
            ? provideValue(
                nodeId,
                `${fluentExpressionKey}-${expression.parameterPrefix}${i + 1}`,
                arg,
                nameResolver,
              )
            : "undefined",
        );
      switch (selector.type) {
        case "method":
          return `${target}.${selector.methodName}(${args})`;
        case "call":
          return `${target}(${args})`;
        case "extension-method": {
          const extensionMethod = nameResolver.importBinding(
            selector.definition,
          );
          return `${extensionMethod}(${target}, ${args})`;
        }
      }
    }, head);
  }
  throw new Error("Unreachable");
}
