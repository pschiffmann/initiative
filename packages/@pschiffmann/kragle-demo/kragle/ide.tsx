import { IDE } from "@kragle/ide";
import { createRoot } from "react-dom/client";
import * as nodesModule from "./nodes/index.js";

import "@kragle/ide/main.scss";
import { StrictMode } from "react";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <IDE nodes={nodesModule} />
  </StrictMode>
);
