import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import validate from "validate-npm-package-name";
import { App } from "./app.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log(validate("foo::bar"));
