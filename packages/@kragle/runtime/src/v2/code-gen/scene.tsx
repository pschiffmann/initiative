import { SceneDocument } from "../scene-data/index.js";

export function generateEmptyScene(name: string): string {
  return `export function ${name}() {
  return <div>Error: The scene is empty.</div>;
}`;
}

export function generateScene(name: string, document: SceneDocument): string {
  return `export function ${name}() {
  return <${document.getRootNodeId()!}_Adapter />;
}`;
}
