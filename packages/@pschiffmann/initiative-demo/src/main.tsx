import { ArticleManagement } from "#initiative/scenes/article-management/scene.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "../initiative/locale-context.js";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <LocaleProvider locale="en">
      <ArticleManagement
        article={{ id: 12345, name: "Frog", price: 499 }}
        username="pschiffmann"
      />
    </LocaleProvider>
  </StrictMode>,
);
