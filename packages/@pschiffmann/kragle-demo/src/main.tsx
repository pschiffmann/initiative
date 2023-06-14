import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
