import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ArticleManagement } from "../kragle/scenes/article-management/scene.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ArticleManagement />
  </StrictMode>
);
