import { SceneDocument, SlotNodeData } from "#shared";
import { dedent } from "@pschiffmann/std/dedent";
import { getSceneSlotContextName } from "./context.js";
import { generateExpression } from "./expression.js";
import { NameResolver } from "./name-resolver.js";
import { generateType } from "./types.js";

export function generateSlotNodeRuntime(
  document: SceneDocument,
  nameResolver: NameResolver,
  nodeId: string,
): string {
  const nodeData = document.getSlotNode(nodeId);
  return [
    generateSlotContext(nodeData, nameResolver),
    generateNodeAdapter(nodeData, nameResolver),
  ].join("\n\n");
}

function generateNodeAdapter(
  nodeData: SlotNodeData,
  nameResolver: NameResolver,
) {
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
      function ${Adapter}(props: ${StyleProps}): ${ReactElement} {
        throw new Error("Node: ${nodeData.id} contains errors!");
      }
      `;
  }

  const memo = nameResolver.importBinding({
    moduleName: "react",
    exportName: "memo",
  });
  const props = nodeData.outputNames.map(
    (outputName) =>
      `${outputName}={${generateExpression(
        nodeData.id,
        outputName,
        nodeData.outputValues[outputName]!,
        nameResolver,
      )}}`,
  );
  const SceneSlotContext = getSceneSlotContextName(nameResolver, nodeData.id);

  return dedent`
    const ${Adapter} = ${memo}(function ${Adapter}({
      className,
      style,
    }: ${StyleProps}) {
      const Component = useContext(${SceneSlotContext});
      return (
        <Component
          className={className}
          style={style}
          ${props.join("\n")}
        />
      );
    });
    `;
}

function generateSlotContext(
  nodeData: SlotNodeData,
  nameResolver: NameResolver,
) {
  const createContext = nameResolver.importBinding({
    moduleName: "react",
    exportName: "createContext",
  });
  const ComponentType = nameResolver.importType({
    moduleName: "react",
    exportName: "ComponentType",
  });
  const StyleProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema",
    exportName: "StyleProps",
  });

  const SceneSlotProps = nameResolver.declareName(`${nodeData.id}SlotProps`);
  const SceneSlotContext = getSceneSlotContextName(nameResolver, nodeData.id);
  const propTypes = nodeData.outputNames.map((outputName) => {
    const type = generateType(nodeData.outputTypes[outputName], nameResolver);
    return `${outputName}: ${type},`;
  });

  return dedent`
    export interface ${SceneSlotProps} extends ${StyleProps} {
      ${propTypes.join("\n")}
    }

    const ${SceneSlotContext} = ${createContext}<${ComponentType}<
      ${SceneSlotProps}
    >>(null!);
    `;
}
