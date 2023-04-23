import sceneJson from "#scenes/counter-button-dialog.json";
import {
  Scene,
  SceneRuntime,
  parseSceneJson,
  resolveNodeDefinitions,
} from "@kragle/runtime";
import * as nodes from "../kragle/nodes/index.js";

const { sceneDocument, errors } = parseSceneJson(
  resolveNodeDefinitions(nodes),
  sceneJson as any
);
if (errors) console.log(errors);
const runtime = new SceneRuntime(sceneDocument);

export function App() {
  return <Scene runtime={runtime} />;
}
