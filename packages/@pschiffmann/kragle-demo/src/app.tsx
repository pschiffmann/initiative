import { jsonRuntime, resolveNodeRefs } from "@kragle/runtime";
import * as nodes from "../kragle/nodes.js";
import sceneJson from "../kragle/scenes/demo-scene.json";

const runtime = new jsonRuntime.SceneRuntime(sceneJson, resolveNodeRefs(nodes));

export function App() {
  return <jsonRuntime.Scene runtime={runtime} />;
}
