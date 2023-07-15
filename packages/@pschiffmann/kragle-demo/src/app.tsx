import sceneJson from "#kragle/scenes/article-management/scene.json";
import {
  Scene,
  SceneRuntime,
  resolveDefinitions,
  sceneDocumentFromJson,
} from "@kragle/runtime";

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
  console.log("test");
  return <Scene runtime={runtime} />;
}
