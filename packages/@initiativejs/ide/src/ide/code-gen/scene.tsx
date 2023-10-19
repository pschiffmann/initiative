import { SceneDocument } from "#shared";
import { dedent } from "@pschiffmann/std/dedent";
import { capitalize } from "@pschiffmann/std/string";
import { generateContextProviderJsx } from "./context.js";
import { NameResolver } from "./name-resolver.js";
import { generateType } from "./types.js";

export function generateEmptyScene(name: string): string {
  return dedent`
    export function ${sanitizeSceneName(name)}() {
      return <div>Error: The scene is empty.</div>;
    }
    `;
}

export function generateSceneWithSceneInputs(
  document: SceneDocument,
  nameResolver: NameResolver,
): string {
  const Scene = nameResolver.declareName("Scene");
  const SceneProps = nameResolver.declareName("SceneProps");

  const sceneInputs = [...document.sceneInputs];
  const createContext =
    sceneInputs.length !== 0 &&
    nameResolver.importBinding({
      moduleName: "react",
      exportName: "createContext",
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
        const Context = nameResolver.declareName(`Scene$${name}Context`);
        const type = generateType(data.type, nameResolver);
        return `const ${Context} = ${createContext}<${type}>(null!);`;
      })
      .join("\n")}

    interface ${SceneProps} {
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
    }

    function ${Scene}({
      ${[...document.sceneInputs.keys()].map((name) => `${name},`).join("\n")}
    }: ${SceneProps}) {
      return (
        ${enableFtl ? `<${FluentBundleProvider}>` : ""}
        ${generateContextProviderJsx(
          nameResolver,
          "Scene",
          [...document.sceneInputs.keys()],
          `<${document.getRootNodeId()!}_Adapter />`,
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
