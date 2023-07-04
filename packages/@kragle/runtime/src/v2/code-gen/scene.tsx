import { SceneDocument } from "../scene-data/index.js";

export function generateEmptyScene(name: string): string {
  return `export function ${sanitizeSceneName(name)}() {
  return <div>Error: The scene is empty.</div>;
}`;
}

export function generateScene(document: SceneDocument): string {
  return `export function ${sanitizeSceneName(document.name)}() {
  return <${document.getRootNodeId()!}_Adapter />;
}`;
}

/**
 *
 */
function sanitizeSceneName(name: string): string {
  const first = name[0].toUpperCase();
  const rest = name.substring(1).replaceAll(/[_-]/gi, "");
  return first + rest;
}
