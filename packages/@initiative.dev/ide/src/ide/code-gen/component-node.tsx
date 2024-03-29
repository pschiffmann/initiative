import { NodeDefinition } from "@initiative.dev/schema";
import { dedent } from "@pschiffmann/std/dedent";

import { ComponentNodeData, SceneDocument } from "#shared";
import {
  generateOutputContextProviderJsx,
  getNodeOutputContextName,
} from "./context.js";
import { generateExpression } from "./expression.js";
import { NameResolver } from "./name-resolver.js";

export function generateComponentNodeRuntime(
  document: SceneDocument,
  nameResolver: NameResolver,
  nodeId: string,
): string {
  const nodeData = document.getComponentNode(nodeId);
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
        ${generateOutputContextProviderJsx(
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
        ${generateOutputContextProviderJsx(
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
  const ReactElement = nameResolver.importType({
    moduleName: "react",
    exportName: "ReactElement",
  });

  const outputNames = nodeData.schema.slotAttributes[slotName].outputNames;

  return dedent`
    function ${SlotComponent}({
      className,
      style,
      index,
      ${outputNames.map((n) => `${n},`).join("\n")}
    }: ${SlotComponentProps}<${NodeSchema}, "${slotName}">): ${ReactElement} {
      switch(index) {
        ${nodeData
          .forEachChildInSlot(slotName, (childId, index) => {
            const ChildAdapter = nameResolver.declareName(`${childId}_Adapter`);
            return dedent`
              case ${index}:
                return (
                  ${generateOutputContextProviderJsx(
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
