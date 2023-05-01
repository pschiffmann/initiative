// import sceneJson from "#scenes/counter-button-dialog.json";
import sceneJson from "#scenes/article-management.json";
import {
  Scene,
  SceneDocument,
  SceneRuntime,
  parseSceneJson,
  resolveNodeDefinitions,
} from "@kragle/runtime";
import * as nodes from "../kragle/nodes/index.js";

const { sceneDocument, errors } = parseSceneJson(
  new SceneDocument(resolveNodeDefinitions(nodes)),
  sceneJson as any
);
if (errors) console.log(errors);
const runtime = new SceneRuntime(sceneDocument);

export function App() {
  return <Scene runtime={runtime} />;
}
