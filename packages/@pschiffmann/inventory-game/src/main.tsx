import { App } from "#initiative/scenes/app/scene.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
