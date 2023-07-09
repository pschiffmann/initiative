import sceneJson from "#kragle/scenes/article-management/scene.json";
import {
  Scene,
  SceneRuntime,
  generateCodeForScene,
  resolveDefinitions,
  sceneDocumentFromJson,
} from "@kragle/runtime";

import { Articlemanagement } from "../kragle/scenes/article-management/code-gen-test-output.js";

const [, definitions] = resolveDefinitions([
  ["#kragle/libraries/index.js", await import("#kragle/libraries/index.js")],
  ["#kragle/nodes/index.js", await import("#kragle/nodes/index.js")],
]);
const { document, errors } = sceneDocumentFromJson(
  definitions,
  "article-management",
  sceneJson as any
);
console.log({ definitions, document, errors });
const runtime = new SceneRuntime(document!);

export function App() {
  console.log(generateCodeForScene(document!));
  return <Articlemanagement />;
  return <Scene runtime={runtime} />;
}
