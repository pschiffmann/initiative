import { Editor } from "@initiative.dev/ide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

import "@initiative.dev/ide/styles.css";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Editor projectId="@pschiffmann/counter-app" definitions={definitions} />
  </StrictMode>,
);
