import {
  ComponentNodeData,
  EnumValueExpression,
  Expression,
  FluentMessageExpression,
  JsonLiteralExpression,
  MemberAccessExpression,
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

export function generateComponentNodeRuntime(
  document: SceneDocument,
  nameResolver: NameResolver,
  nodeId: string,
): string {
  const nodeData = document.getNode(nodeId);
  const definition = document.definitions.getNode(nodeData.type);

  const result = [
    generateOutputContexts(nodeData, definition, nameResolver),
    generateAdapter(nodeData, definition, nameResolver),
  ];
  if (nodeData.schema.hasSlots()) {
    result.push(generateSlotsLiteral(nodeData, definition, nameResolver));
  }
  nodeData.schema.forEachSlot((slotName, { outputNames, isCollectionSlot }) => {
    if (isCollectionSlot) {
      result.push(
        generateCollectionSlotComponent(
          nodeData,
          definition,
          slotName,
          nameResolver,
        ),
      );
    } else if (outputNames.length !== 0) {
      result.push(
        generateSlotComponent(nodeData, definition, slotName, nameResolver),
      );
    }
  });
  if (nodeData.schema.hasRegularOutputs()) {
    result.push(generateOutputsProvider(nodeData, definition, nameResolver));
  }

  return result.join("\n\n");
}

function generateAdapter(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  const Adapter = nameResolver.declareName(`${nodeData.id}_Adapter`);
  const StyleProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema",
    exportName: "StyleProps",
  });

  if (nodeData.errors) {
    const ReactElement = nameResolver.importType({
      moduleName: "react",
      exportName: "ReactElement",
    });
    return dedent`
      function ${Adapter}({}: ${StyleProps}): ${ReactElement} {
        throw new Error("Node: ${nodeData.id} contains errors!");
      }
      `;
  }

  const memo = nameResolver.importBinding({
    moduleName: "react",
    exportName: "memo",
  });
  const Component = nameResolver.importBinding(definition);

  const props: string[] = [];

  // Regular inputs
  nodeData.forEachInput((expression, attributes, inputName, index) => {
    if (!expression || index !== undefined) return;
    props.push(
      `${inputName}={${generateExpression(
        nodeData.id,
        inputName,
        expression,
        nameResolver,
      )}}`,
    );
  });

  // Collection inputs
  nodeData.schema.forEachInput((inputName, { slot }) => {
    if (!slot) return;
    const expressions = nodeData.forEachIndexInCollectionInput(
      inputName,
      (expression, index) =>
        expression
          ? generateExpression(
              nodeData.id,
              `${inputName}-${index + 1}`,
              expression,
              nameResolver,
            )
          : "undefined",
    );
    props.push(`${inputName}={[${expressions.join(", ")}]}`);
  });

  // OutputsProvider
  if (nodeData.schema.hasRegularOutputs()) {
    const OutputsProvider = nameResolver.declareName(
      `${nodeData.id}_OutputsProvider`,
    );
    props.push(`OutputsProvider={${OutputsProvider}}`);
  }

  // slots
  if (nodeData.schema.hasSlots()) {
    const slots = nameResolver.declareName(`${nodeData.id}$slots`);
    props.push(`slots={${slots}}`);
  }

  return dedent`
    const ${Adapter} = ${memo}(function ${Adapter}({
      className,
      style,
    }: ${StyleProps}) {
      return (
        <${Component}
          className={className}
          style={style}
          ${props.join("\n")}
        />
      );
    });
    `;
}

function generateOutputContexts(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  if (Object.keys(nodeData.schema.outputAttributes).length === 0) return "";

  const createContext = nameResolver.importBinding({
    moduleName: "react",
    exportName: "createContext",
  });
  const NodeSchema = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const outputTypes = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "OutputTypes",
  });
  return nodeData.schema
    .forEachOutput((outputName) => {
      const contextName = getNodeOutputContextName(
        nameResolver,
        nodeData.id,
        outputName,
      );
      const contextType = `${outputTypes}<${NodeSchema}>["${outputName}"]`;
      return `const ${contextName} = ${createContext}<${contextType}>(null!);`;
    })
    .join("\n");
}

function generateOutputsProvider(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  const NodeSchema = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const OutputsProviderProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "OutputsProviderProps",
  });
  const OutputsProvider = nameResolver.declareName(
    `${nodeData.id}_OutputsProvider`,
  );

  const outputNames: string[] = [];
  nodeData.schema.forEachOutput((outputName, { slot }) => {
    if (!slot) outputNames.push(outputName);
  });

  return dedent`
    function ${OutputsProvider}({
      ${outputNames.map((n) => `${n},`).join("\n")}
      children,
    }: ${OutputsProviderProps}<${NodeSchema}>) {
      return (
        ${generateContextProviderJsx(
          nameResolver,
          nodeData.id,
          outputNames,
          "{children}",
        )}
      );
    }
    `;
}

function generateSlotsLiteral(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  nameResolver: NameResolver,
): string {
  const values = nodeData.schema.forEachSlot(
    (slotName, { outputNames, isCollectionSlot }) => {
      let value: string;
      if (isCollectionSlot) {
        const size = nodeData.collectionSlotSizes[slotName];
        const Component = nameResolver.declareName(
          `${nodeData.id}_${slotName}`,
        );
        value = `{ size: ${size}, Component: ${Component} }`;
      } else if (outputNames.length !== 0) {
        const Component = nameResolver.declareName(
          `${nodeData.id}_${slotName}`,
        );
        value = `{ Component: ${Component} }`;
      } else {
        const childId = nodeData.slots[slotName];
        const Component = nameResolver.declareName(`${childId}_Adapter`);
        value = `{ Component: ${Component} }`;
      }
      return `${slotName}: ${value},`;
    },
  );

  const slots = nameResolver.declareName(`${nodeData.id}$slots`);
  return dedent`
    const ${slots} = {
      ${values.join("\n")}
    };
    `;
}

function generateSlotComponent(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  slotName: string,
  nameResolver: NameResolver,
): string {
  const SlotComponent = nameResolver.declareName(`${nodeData.id}_${slotName}`);
  const NodeSchema = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const SlotComponentProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "SlotComponentProps",
  });
  const ChildAdapter = nameResolver.declareName(
    `${nodeData.slots[slotName]}_Adapter`,
  );

  const outputNames = nodeData.schema.slotAttributes[slotName].outputNames;

  return dedent`
    function ${SlotComponent}({
      className,
      style,
      ${outputNames.map((n) => `${n},`).join("\n")}
    }: ${SlotComponentProps}<${NodeSchema}, "${slotName}">) {
      return (
        ${generateContextProviderJsx(
          nameResolver,
          nodeData.id,
          outputNames,
          `<${ChildAdapter} className={className} style={style} />`,
        )}
      );
    }
    `;
}

function generateCollectionSlotComponent(
  nodeData: ComponentNodeData,
  definition: NodeDefinition,
  slotName: string,
  nameResolver: NameResolver,
): string {
  const SlotComponent = nameResolver.declareName(`${nodeData.id}_${slotName}`);
  const NodeSchema = nameResolver.importType({
    moduleName: definition.moduleName,
    exportName: definition.exportName + "Schema",
  });
  const SlotComponentProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema/code-gen-helpers",
    exportName: "SlotComponentProps",
  });

  const outputNames = nodeData.schema.slotAttributes[slotName].outputNames;

  return dedent`
    function ${SlotComponent}({
      className,
      style,
      index,
      ${outputNames.map((n) => `${n},`).join("\n")}
    }: ${SlotComponentProps}<${NodeSchema}, "${slotName}">) {
      switch(index) {
        ${nodeData
          .forEachChildInSlot(slotName, (childId, index) => {
            const ChildAdapter = nameResolver.declareName(`${childId}_Adapter`);
            return dedent`
              case ${index}:
                return (
                  ${generateContextProviderJsx(
                    nameResolver,
                    nodeData.id,
                    outputNames,
                    `<${ChildAdapter} className={className} style={style} />`,
                  )});
              `;
          })
          .join("\n")}
        default:
          throw new Error(\`Invalid index '\${index}'.\`);
      }
    }
    `;
}

function generateExpression(
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
              const value = generateExpression(
                nodeId,
                `${fluentExpressionKey}-${argName}`,
                expr!,
                nameResolver,
              );
              return `"${argName}": ${value},`;
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
          nameResolver,
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
            ? generateExpression(
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
