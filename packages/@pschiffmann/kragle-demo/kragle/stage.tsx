import { Stage } from "@kragle/ide";
import { resolveNodeDefinitions } from "@kragle/runtime";
import { createRoot } from "react-dom/client";
import * as nodesModule from "./nodes/index.js";

const nodeDefinitions = resolveNodeDefinitions(nodesModule);
const root = createRoot(document.querySelector("#root")!);
root.render(<Stage nodeDefinitions={nodeDefinitions} />);
