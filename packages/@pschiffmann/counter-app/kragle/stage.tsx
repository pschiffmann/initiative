import { Stage } from "@kragle/editor";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "../src/components/theme-provider.js";
import { definitions } from "./definitions.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider>
      <Stage definitions={definitions} />
    </ThemeProvider>
  </StrictMode>
);
