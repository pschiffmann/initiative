import { Stage } from "@initiativejs/ide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Stage definitions={definitions} />
  </StrictMode>,
);