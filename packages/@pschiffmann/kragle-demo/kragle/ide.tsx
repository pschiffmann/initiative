import IDE from "@kragle/runtime";
import { createRoot } from "react-dom/client";
import * as nodes from "./nodes.js";

const root = createRoot(document.querySelector("#root")!);
root.render(<IDE nodes={nodes} />);
