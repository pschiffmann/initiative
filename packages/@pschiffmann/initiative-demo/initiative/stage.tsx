import { Stage } from "@initiative.dev/ide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { definitions } from "./definitions.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <Stage
      definitions={definitions}
      debugValues={{ article: { id: 12345, name: "Frog", price: 499 } }}
    />
  </StrictMode>,
);
