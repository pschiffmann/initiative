import { ArticleManagement } from "#initiative/scenes/article-management/scene.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <ArticleManagement />
  </StrictMode>,
);