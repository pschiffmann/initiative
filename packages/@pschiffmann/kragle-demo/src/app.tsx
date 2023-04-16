import sceneJson from "#scenes/counter-button-dialog.json";
import { jsonRuntime, resolveNodeRefs } from "@kragle/runtime";
import * as nodes from "../kragle/nodes/index.js";

const runtime = new jsonRuntime.SceneRuntime(
  sceneJson as any,
  resolveNodeRefs(nodes)
);

export function App() {
  return <jsonRuntime.Scene runtime={runtime} />;
}
