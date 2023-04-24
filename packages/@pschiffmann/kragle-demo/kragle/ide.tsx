import { IDE } from "@kragle/ide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as nodesModule from "./nodes/index.js";

import "@kragle/ide/main.scss";
import { resolveNodeDefinitions } from "@kragle/runtime";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <IDE nodeDefinitions={resolveNodeDefinitions(nodesModule)} />
  </StrictMode>
);
