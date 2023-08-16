import { Editor } from "@initiativejs/ide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

import "@initiativejs/ide/styles.css";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Editor definitions={definitions} />
  </StrictMode>,
);
