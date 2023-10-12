import { SceneDocument } from "#shared";
import { capitalize } from "@pschiffmann/std/string";
import {
  generateContextProviderJsx,
  getSceneInputContextName,
} from "./context.js";
import { ImportNames } from "./imports.js";
import { generateType } from "./types.js";

export function generateEmptyScene(name: string): string {
  return `export function ${sanitizeSceneName(name)}() {
  return <div>Error: The scene is empty.</div>;
}`;
}

export function generateSceneWithoutSceneInputs(
  document: SceneDocument,
): string {
  return `export function ${sanitizeSceneName(document.name)}() {
  return <${document.getRootNodeId()!}_Adapter />;
}`;
}

export function generateSceneWithSceneInputs(
  document: SceneDocument,
  importNames: ImportNames,
): string {
  const createContext = importNames.importBinding({
    moduleName: "react",
    exportName: "createContext",
  });
  const contextObjects: string[] = [];
  const props: string[] = [];
  for (const [name, data] of document.sceneInputs) {
    const contextName = getSceneInputContextName(name);
    const type = generateType(data.type, importNames);
    contextObjects.push(
      `const ${contextName} = ${createContext}<${type}>(null!);`,
    );
    props.push(`${name}: ${type};`);
  }

  const componentName = sanitizeSceneName(document.name);
  const jsx = generateContextProviderJsx(
    "Scene",
    [...document.sceneInputs.keys()],
    `<${document.getRootNodeId()!}_Adapter />`,
  );
  return `export {
  Scene as ${componentName},
  type SceneProps as ${componentName}Props,
};

${contextObjects.join("\n")}

interface SceneProps {
  ${props.join("\n  ")}
}

function Scene({
  ${[...document.sceneInputs.keys()].join(",\n  ")}
}: SceneProps) {
  return (${jsx});
}`;
}

/**
 *
 */
function sanitizeSceneName(name: string): string {
  return capitalize(
    name.replaceAll(/[_-].?/gi, (m) => capitalize(m.substring(1))),
  );
}
