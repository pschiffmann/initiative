import { Editor } from "@kragle/editor";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

import "@kragle/editor/styles.css";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Editor definitions={definitions} />
  </StrictMode>
);
