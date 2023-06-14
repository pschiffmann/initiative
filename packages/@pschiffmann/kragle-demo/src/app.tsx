import sceneJson from "#kragle/scenes/article-management.json";
import {
  Scene,
  SceneRuntime,
  resolveDefinitions,
  sceneDocumentFromJson,
} from "@kragle/runtime/v2";

const [, definitions] = resolveDefinitions([
  ["#kragle/libraries/index.js", await import("#kragle/libraries/index.js")],
  ["#kragle/nodes/index.js", await import("#kragle/nodes/index.js")],
]);
const { document, errors } = sceneDocumentFromJson(
  definitions,
  sceneJson as any
);
console.log({ definitions, document, errors });
const runtime = new SceneRuntime(document!);

export function App() {
  return <Scene runtime={runtime} />;
}
