import { IDE } from "@kragle/ide";
import { createRoot } from "react-dom/client";
import * as nodes from "./nodes.js";

import "@kragle/ide/main.scss";

const root = createRoot(document.querySelector("#root")!);
root.render(<IDE nodes={nodes} />);
