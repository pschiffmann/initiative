import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app.js";
import { ThemeProvider } from "./components/theme-provider.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
