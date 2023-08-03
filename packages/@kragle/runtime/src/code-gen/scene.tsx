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
  return capitalize(
    name.replaceAll(/[_-].?/gi, (m) => capitalize(m.substring(1))),
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.substring(1);
}
