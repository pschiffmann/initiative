import { dedent } from "@pschiffmann/std/dedent";
import { capitalize } from "@pschiffmann/std/string";

import { SceneDocument, SlotNodeData } from "#shared";
import {
  generateOutputContextProviderJsx,
  generateSceneSlotContextProviderJsx,
  getSceneInputContextName,
} from "./context.js";
import { NameResolver } from "./name-resolver.js";
import { generateType } from "./types.js";

export function generateEmptyScene(
  name: string,
  nameResolver: NameResolver,
): string {
  const StyleProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema",
    exportName: "StyleProps",
  });
  return dedent`
    export function ${sanitizeSceneName(name)}({
      className,
      style,
    }: ${StyleProps}) {
      return (
        <div className={className} style={style}>
          Error: The scene is empty.
        </div>
      );
    }
    `;
}

export function generateScene(
  document: SceneDocument,
  nameResolver: NameResolver,
): string {
  const Scene = nameResolver.declareName("Scene");
  const SceneProps = nameResolver.declareName("SceneProps");
  const StyleProps = nameResolver.importType({
    moduleName: "@initiative.dev/schema",
    exportName: "StyleProps",
  });

  const sceneInputs = [...document.sceneInputs];
  const createContext =
    sceneInputs.length !== 0 &&
    nameResolver.importBinding({
      moduleName: "react",
      exportName: "createContext",
    });

  const sceneSlots = document
    .keys()
    .map((nodeId) => document.getNode(nodeId))
    .filter((node): node is SlotNodeData => node instanceof SlotNodeData);
  const ComponentType =
    sceneSlots.length !== 0 &&
    nameResolver.importType({
      moduleName: "react",
      exportName: "ComponentType",
    });

  const enableFtl = !!document.projectConfig.locales;
  const FluentBundleProvider =
    enableFtl && nameResolver.declareName("FluentBundleProvider");

  const componentName = sanitizeSceneName(document.name);

  return dedent`
    export {
      ${Scene} as ${componentName},
      type ${SceneProps} as ${componentName}Props,
    };

    ${[...document.sceneInputs]
      .map(([name, data]) => {
        const Context = getSceneInputContextName(nameResolver, name);
        const type = generateType(data.type, nameResolver);
        return `const ${Context} = ${createContext}<${type}>(null!);`;
      })
      .join("\n")}

    interface ${SceneProps} extends ${StyleProps} {
      ${sceneInputs
        .map(
          ([name, { type, doc }]) => dedent`
            /**
             * ${doc.replaceAll("\n", "\n * ")}
             */
            ${name}: ${generateType(type, nameResolver)};
            `,
        )
        .join("\n\n")}
      ${sceneSlots.length === 0 ? "" : `slots: {`}
        ${sceneSlots
          .map(({ id }) => {
            const SceneSlotProps = nameResolver.declareName(`${id}SlotProps`);
            return `readonly ${id}: ${ComponentType}<${SceneSlotProps}>;`;
          })
          .join("\n")}
      ${sceneSlots.length === 0 ? "" : `};`}
    }

    function ${Scene}({
      className,
      style,
      ${[...document.sceneInputs.keys()].map((name) => `${name},`).join("\n")}
      ${sceneSlots.length !== 0 ? "slots," : ""}
    }: ${SceneProps}) {
      return (
        ${enableFtl ? `<${FluentBundleProvider}>` : ""}
        ${generateOutputContextProviderJsx(
          nameResolver,
          "Scene",
          [...document.sceneInputs.keys()],
          generateSceneSlotContextProviderJsx(
            nameResolver,
            sceneSlots,
            dedent`
              <${document.getRootNodeId()!}_Adapter
                className={className}
                style={style}
              />
              `,
          ),
        )}
        ${enableFtl ? `</${FluentBundleProvider}>` : ""}
      );
    }
    `;
}

/**
 *
 */
function sanitizeSceneName(name: string): string {
  return capitalize(
    name.replaceAll(/[_-].?/gi, (m) => capitalize(m.substring(1))),
  );
}
